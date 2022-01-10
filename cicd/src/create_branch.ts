import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import {
  CodeBuildClient,
  CreateProjectCommand,
  StartBuildCommand,
} from "@aws-sdk/client-codebuild";

const REGION = process.env["AWS_REGION"] as string;
const ACCOUNT_ID = process.env["ACCOUNT_ID"] as string;
const CODE_BUILD_ROLE_ARN = process.env["CODE_BUILD_ROLE_ARN"] as string;
const ARTIFACT_BUCKET_NAME = process.env["ARTIFACT_BUCKET"] as string;
const CODEBUILD_NAME_PREFIX = process.env["CODEBUILD_NAME_PREFIX"] as string;

const codeBuild = new CodeBuildClient({});

interface CreatePayload {
  ref: string;
  ref_type: string;
  master_branch: string;
  description: string;
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

  const body = JSON.parse(event.body ?? "{}") as CreatePayload;

  if (body.ref_type === "branch") {
    const branch = body.ref;
    const repoFullName = body.repository.full_name;

    await codeBuild.send(
      new CreateProjectCommand({
        name: `${CODEBUILD_NAME_PREFIX}-${branch}-create`,
        description: "Build project to deploy branch pipeline",
        source: {
          type: "GITHUB",
          location: `https://github.com/${repoFullName}.git`,
          auth: {
            type: "OAUTH",
          },
          buildspec: generateBuildSpec(branch),
        },
        sourceVersion: `refs/heads/${branch}`,
        artifacts: {
          type: "S3",
          location: ARTIFACT_BUCKET_NAME,
          path: branch,
          packaging: "NONE",
          artifactIdentifier: "BranchBuildArtifact",
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
      new StartBuildCommand({ projectName: `CodeBuild-${branch}-create` })
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
          - npm i -g aws-cdk
          - npm ci
      build:
        commands:
          - cdk synth
          - cdk deploy --require-approval=never
    artifacts:
      files:
        - '**/*'
  `;
}
