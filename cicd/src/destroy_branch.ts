import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import {
  CodeBuildClient,
  CreateProjectCommand,
  StartBuildCommand,
  DeleteProjectCommand,
} from "@aws-sdk/client-codebuild";

const REGION = process.env["AWS_REGION"] as string;
const ACCOUNT_ID = process.env["ACCOUNT_ID"] as string;
const CODE_BUILD_ROLE_ARN = process.env["CODE_BUILD_ROLE_ARN"] as string;
const ARTIFACT_BUCKET_NAME = process.env["ARTIFACT_BUCKET"] as string;
const CODEBUILD_NAME_PREFIX = process.env["CODEBUILD_NAME_PREFIX"] as string;
const DEV_STAGE_NAME = process.env["DEV_STAGE_NAME"] as string;

const codeBuild = new CodeBuildClient({});

interface DeletePayload {
  ref: string;
  ref_type: string;
  pusher_type: string;
  repository: {
    full_name: string;
  };
  organization: Record<string, unknown>;
  installation: Record<string, unknown>;
  sender: Record<string, unknown>;
}

export const handler: APIGatewayProxyHandlerV2<void> = async (event) => {
  console.log(JSON.stringify(event));

  const body = JSON.parse(event.body ?? "{}") as DeletePayload;

  if (body.ref_type === "branch") {
    const branch = body.ref;

    await codeBuild.send(
      new CreateProjectCommand({
        name: `${CODEBUILD_NAME_PREFIX}-${branch}-destroy`,
        description: "Build project to destroy branch pipeline",
        source: {
          type: "S3",
          location: `${ARTIFACT_BUCKET_NAME}/${branch}/${CODEBUILD_NAME_PREFIX}-${branch}-create/`,
          buildspec: generateBuildSpec(branch),
        },
        artifacts: {
          type: "NO_ARTIFACTS",
        },
        environment: {
          type: "LINUX_CONTAINER",
          image: "aws/codebuild/standard:5.0",
          computeType: "BUILD_GENERAL1_SMALL",
        },
        serviceRole: CODE_BUILD_ROLE_ARN,
      })
    );

    await codeBuild.send(
      new StartBuildCommand({
        projectName: `${CODEBUILD_NAME_PREFIX}-${branch}-destroy`,
      })
    );

    await codeBuild.send(
      new DeleteProjectCommand({
        name: `${CODEBUILD_NAME_PREFIX}-${branch}-destroy`,
      })
    );

    await codeBuild.send(
      new DeleteProjectCommand({
        name: `${CODEBUILD_NAME_PREFIX}-${branch}-create`,
      })
    );
  }
};

function generateBuildSpec(branch: string): string {
  return `version: 0.2
    env:
      variables:
        BRANCH: ${branch}
        DEV_ACCOUNT_ID: ${ACCOUNT_ID}
        PROD_ACCOUNT_ID: ${ACCOUNT_ID}
        REGION: ${REGION}
    phases:
      pre_build:
        commands:
          - npm i -g npm@8
          - npm install -g aws-cdk
          - npm ci
      build:
        commands:
          - cdk destroy cdk-pipelines-multi-branch-${branch} --force
          - aws cloudformation delete-stack --stack-name ${DEV_STAGE_NAME}-${branch}
          - aws s3 rm s3://${ARTIFACT_BUCKET_NAME}/${branch} --recursive
  `;
}
