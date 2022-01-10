import path from "path";
import { Construct } from "constructs";
import { RemovalPolicy, Stack, StackProps } from "aws-cdk-lib"; // core constructs

import {
  CodePipeline,
  CodePipelineSource,
  ManualApprovalStep,
  ShellStep,
} from "aws-cdk-lib/pipelines";
import { aws_codestarconnections as codestarconnections } from "aws-cdk-lib";
import { aws_s3 as s3 } from "aws-cdk-lib";
import { aws_lambda } from "aws-cdk-lib";
import { aws_lambda_nodejs } from "aws-cdk-lib";
import { HttpApi, HttpMethod } from "@aws-cdk/aws-apigatewayv2-alpha"; // experimental
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha"; // experimental

import { PipelineIAMRoles } from "./iam";
import { CdkTranslatorStage } from "../lib/cdk-translator-stage";

export interface PipelineStackProps extends StackProps {
  codebuildPrefix: string;
  region: string;
  repoName: string;
  branch: string;
  defaultBranch: string;
  devAccountId: string;
  prodAccountId?: string;
}

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: PipelineStackProps) {
    super(scope, id, props);

    const {
      codebuildPrefix,
      region,
      repoName,
      branch,
      defaultBranch,
      devAccountId,
      prodAccountId,
    } = props as PipelineStackProps;

    const githubConnection = new codestarconnections.CfnConnection(
      this,
      "GitHubConnection",
      {
        connectionName: "github-connection",
        providerType: "GitHub",
      }
    );

    const source = CodePipelineSource.connection(repoName, branch, {
      connectionArn: githubConnection.attrConnectionArn,
    });

    const synthStep = new ShellStep("Synth", {
      input: source,
      env: {
        BRANCH: branch,
        DEV_ACCOUNT_ID: devAccountId,
        PROD_ACCOUNT_ID: prodAccountId || "",
      },
      installCommands: ["npm i -g npm@8", "npm ci"],
      commands: ["npx cdk synth"],
    });

    // Pipeline creation starts
    const pipeline = new CodePipeline(this, `Pipeline-${branch}`, {
      pipelineName: `CICDPipeline-${branch}`,
      crossAccountKeys: true,
      synth: synthStep,
    });

    const devStageName = "Dev";

    const devStage = new CdkTranslatorStage(this, devStageName, {
      env: { account: devAccountId, region: region },
      defaultBranch,
      branch,
    });

    pipeline.addStage(devStage);

    if (branch === defaultBranch) {
      const prodStage = new CdkTranslatorStage(this, "Prod", {
        env: { account: prodAccountId, region: region },
        defaultBranch,
        branch,
      });

      pipeline.addStage(prodStage, {
        pre: [
          new ManualApprovalStep("PromoteToProd", {
            comment: "Pre-Prod manual approval",
          }),
        ],
      });

      // Artifact bucket for feature AWS CodeBuild projects
      const artifactBucket = new s3.Bucket(this, "BranchArtifacts", {
        encryption: s3.BucketEncryption.KMS_MANAGED,
        removalPolicy: RemovalPolicy.DESTROY,
        autoDeleteObjects: true,
      });

      // AWS Lambda and AWS CodeBuild projects' IAM Roles.
      const iamStack = new PipelineIAMRoles(this, "IAMPipeline", {
        devAccountId: devAccountId,
        region: region,
        connectionArn: githubConnection.attrConnectionArn,
        artifactBucketArn: artifactBucket.bucketArn,
        codebuildPrefix: codebuildPrefix,
      });

      // AWS Lambda function triggered upon branch creation
      const createBranchFunc = new aws_lambda_nodejs.NodejsFunction(
        this,
        "LambdaTriggerCreateBranch",
        {
          runtime: aws_lambda.Runtime.NODEJS_14_X,
          functionName: "LambdaTriggerCreateBranch",
          entry: path.resolve(__dirname, "src/create_branch.ts"),
          handler: "handler",
          environment: {
            ACCOUNT_ID: devAccountId,
            CODE_BUILD_ROLE_ARN: iamStack.codeBuildRole.roleArn,
            ARTIFACT_BUCKET: artifactBucket.bucketName,
            CODEBUILD_NAME_PREFIX: codebuildPrefix,
          },
          role: iamStack.createBranchRole,
        }
      );

      // AWS Lambda function triggered upon branch deletion
      const deleteBranchFunc = new aws_lambda_nodejs.NodejsFunction(
        this,
        "LambdaTriggerDestroyBranch",
        {
          runtime: aws_lambda.Runtime.NODEJS_14_X,
          functionName: "LambdaTriggerDestroyBranch",
          entry: path.resolve(__dirname, "src/destroy_branch.ts"),
          handler: "handler",
          environment: {
            ACCOUNT_ID: devAccountId,
            CODE_BUILD_ROLE_ARN: iamStack.codeBuildRole.roleArn,
            ARTIFACT_BUCKET: artifactBucket.bucketName,
            CODEBUILD_NAME_PREFIX: codebuildPrefix,
            DEV_STAGE_NAME: `${devStageName}-${devStage.mainStackName}`,
          },
          role: iamStack.deleteBranchRole,
        }
      );

      // API Gateway and routes
      const triggerAPI = new HttpApi(this, "TriggerAPI");

      triggerAPI.addRoutes({
        path: "/create",
        methods: [HttpMethod.POST],
        integration: new HttpLambdaIntegration(
          "CreateBranchFuncIntegration",
          createBranchFunc
        ),
      });

      triggerAPI.addRoutes({
        path: "/delete",
        methods: [HttpMethod.POST],
        integration: new HttpLambdaIntegration(
          "DeleteBranchFuncIntegration",
          deleteBranchFunc
        ),
      });
    }
  }
}
