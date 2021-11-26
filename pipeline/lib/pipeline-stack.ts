import * as cdk from "@aws-cdk/core";
import s3 = require("@aws-cdk/aws-s3");
import codepipeline = require("@aws-cdk/aws-codepipeline");
import codepipeline_actions = require("@aws-cdk/aws-codepipeline-actions");
import codebuild = require("@aws-cdk/aws-codebuild");

export class PipelineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const artifactsBucket = new s3.Bucket(this, "ArtifactsBucket");

    // Pipeline creation starts
    const pipeline = new codepipeline.Pipeline(this, "Pipeline", {
      artifactBucket: artifactsBucket,
    });

    // Declare source code as an artifact
    const sourceOutput = new codepipeline.Artifact();

    const sourceAction = new codepipeline_actions.GitHubSourceAction({
      actionName: "GitHub_Source",
      owner: "anceschialberto",
      repo: "cdk-translator",
      branch: "main",
      // https://docs.aws.amazon.com/cdk/api/latest/docs/aws-codepipeline-actions-readme.html#github
      oauthToken: cdk.SecretValue.secretsManager("my-github-token"),
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

    const buildAction = new codepipeline_actions.CodeBuildAction({
      actionName: "Build",
      project: buildProject,
      input: sourceOutput,
      outputs: [buildOutput],
    });

    // Add the build stage to our pipeline
    pipeline.addStage({
      stageName: "Build",
      actions: [buildAction],
    });

    // const CODEBUILD_BUILD_NUMBER = buildAction.variable(
    //   "CODEBUILD_BUILD_NUMBER"
    // );
    const changeSetName = `CdkDayStack-dev-changeset`;

    // Deploy stage
    pipeline.addStage({
      stageName: "Dev",
      actions: [
        new codepipeline_actions.CloudFormationCreateReplaceChangeSetAction({
          actionName: "CreateChangeSet",
          templatePath: buildOutput.atPath("packaged.yaml"),
          stackName: "CdkDayStack",
          adminPermissions: false,
          changeSetName,
          runOrder: 1,
        }),
        new codepipeline_actions.CloudFormationExecuteChangeSetAction({
          actionName: "Deploy",
          stackName: "CdkDayStack",
          changeSetName,
          runOrder: 2,
        }),
      ],
    });
  }
}
