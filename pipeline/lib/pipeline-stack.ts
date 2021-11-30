import * as cdk from "@aws-cdk/core";
import * as codestarconnections from "@aws-cdk/aws-codestarconnections";
import s3 = require("@aws-cdk/aws-s3");
import codepipeline = require("@aws-cdk/aws-codepipeline");
import codepipeline_actions = require("@aws-cdk/aws-codepipeline-actions");
import codebuild = require("@aws-cdk/aws-codebuild");
import { Effect, Policy, PolicyStatement } from "@aws-cdk/aws-iam";

export class PipelineStack extends cdk.Stack {
  pipelineArn: string;
  pipelineName: string;
  branchName = "main";

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const artifactsBucket = new s3.Bucket(this, "ArtifactsBucket");

    const githubConnection = new codestarconnections.CfnConnection(
      this,
      "GitHubConnection",
      {
        connectionName: "github-connection",
        providerType: "GitHub",
      }
    );

    // Pipeline creation starts
    const pipeline = new codepipeline.Pipeline(this, "Pipeline", {
      artifactBucket: artifactsBucket,
    });

    this.pipelineArn = pipeline.pipelineArn;
    this.pipelineName = pipeline.pipelineName;

    // Declare source code as an artifact
    const sourceOutput = new codepipeline.Artifact();

    // https://docs.aws.amazon.com/codepipeline/latest/userguide/connections-github.html
    const sourceAction =
      new codepipeline_actions.CodeStarConnectionsSourceAction({
        actionName: "Source",
        connectionArn: githubConnection.attrConnectionArn,
        owner: "anceschialberto",
        repo: "cdk-translator",
        branch: this.branchName,
        triggerOnPush: false,
        codeBuildCloneOutput: true,
        variablesNamespace: "SourceVariables",
        output: sourceOutput,
      });

    // Add source stage to pipeline
    pipeline.addStage({
      stageName: "Source",
      actions: [sourceAction],
    });

    // Declare build output as artifacts
    const buildOutput = new codepipeline.Artifact();

    // Declare a new CodeBuild project
    const buildProject = new codebuild.PipelineProject(this, "Build", {
      environment: { buildImage: codebuild.LinuxBuildImage.STANDARD_5_0 },
      environmentVariables: {
        PACKAGE_BUCKET: {
          value: artifactsBucket.bucketName,
        },
      },
    });

    const useCodeStarConnectionPolicyStatement = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ["codestar-connections:UseConnection"],
      resources: [githubConnection.attrConnectionArn],
    });

    buildProject.role?.attachInlinePolicy(
      new Policy(this, "UseCodeStarConnectionPolicy", {
        statements: [useCodeStarConnectionPolicyStatement],
      })
    );

    const buildAction = new codepipeline_actions.CodeBuildAction({
      actionName: "Build",
      input: sourceOutput,
      project: buildProject,
      environmentVariables: {
        COMMIT_ID: {
          value: "#{SourceVariables.CommitId}",
        },
        BRANCH_NAME: {
          value: "#{SourceVariables.BranchName}",
        },
      },
      outputs: [buildOutput],
    });

    // https://github.com/aws/aws-cdk/issues/10632#issuecomment-925186079
    // this.branchName = buildAction.variable("BRANCH_NAME");

    // Add the build stage to our pipeline
    pipeline.addStage({
      stageName: "Build",
      actions: [buildAction],
    });

    // Deploy stage
    pipeline.addStage({
      stageName: "DeployToDev",
      actions: [
        new codepipeline_actions.CloudFormationCreateReplaceChangeSetAction({
          actionName: "CreateChangeSet",
          templatePath: buildOutput.atPath("packaged.yaml"),
          stackName: "CdkDayStack-dev",
          adminPermissions: true,
          changeSetName: "CdkDayStack-change-set",
          runOrder: 1,
        }),
        new codepipeline_actions.CloudFormationExecuteChangeSetAction({
          actionName: "Deploy",
          stackName: "CdkDayStack-dev",
          changeSetName: "CdkDayStack-change-set",
          runOrder: 2,
        }),
      ],
    });
  }
}
