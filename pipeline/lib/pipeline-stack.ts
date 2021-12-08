import { Construct } from "constructs";
import { Stack, StackProps } from "aws-cdk-lib"; // core constructs

import { aws_s3 as s3 } from "aws-cdk-lib";
import { aws_codestarconnections as codestarconnections } from "aws-cdk-lib";
import { aws_codepipeline as codepipeline } from "aws-cdk-lib";
import { aws_codepipeline_actions as codepipeline_actions } from "aws-cdk-lib";
import { aws_codebuild as codebuild } from "aws-cdk-lib";
import { aws_iam as iam } from "aws-cdk-lib";

export class PipelineStack extends Stack {
  pipelineArn: string;
  pipelineName: string;
  branchName = "main";

  constructor(scope: Construct, id: string, props?: StackProps) {
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

    const useCodeStarConnectionPolicyStatement = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["codestar-connections:UseConnection"],
      resources: [githubConnection.attrConnectionArn],
    });

    buildProject.role?.attachInlinePolicy(
      new iam.Policy(this, "UseCodeStarConnectionPolicy", {
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
