import { Construct } from "constructs";

import {
  ManagedPolicy,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";

interface PipelineIAMRolesProps {
  devAccountId: string;
  region: string;
  connectionArn: string;
  artifactBucketArn: string;
  codebuildPrefix: string;
}

export class PipelineIAMRoles extends Construct {
  public createBranchRole: Role;
  public deleteBranchRole: Role;
  public codeBuildRole: Role;

  constructor(scope: Construct, id: string, props: PipelineIAMRolesProps) {
    super(scope, id);

    const {
      devAccountId,
      region,
      connectionArn,
      artifactBucketArn,
      codebuildPrefix,
    } = props;

    // IAM Role for the AWS Lambda function which creates the branch resources
    const createBranchRole = new Role(this, "LambdaCreateBranchRole", {
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
    });

    createBranchRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AWSLambdaBasicExecutionRole"
      )
    );

    createBranchRole.addToPolicy(
      new PolicyStatement({
        actions: ["codebuild:CreateProject", "codebuild:StartBuild"],
        resources: [`arn:aws:codebuild:${region}:${devAccountId}:project/*`],
      })
    );

    // IAM Role for the AWS Lambda function which deletes the branch resources
    const deleteBranchRole = new Role(this, "LambdaDeleteBranchRole", {
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
    });

    deleteBranchRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AWSLambdaBasicExecutionRole"
      )
    );

    deleteBranchRole.addToPolicy(
      new PolicyStatement({
        actions: [
          "codebuild:StartBuild",
          "codebuild:DeleteProject",
          "codebuild:CreateProject",
        ],
        resources: [`arn:aws:codebuild:${region}:${devAccountId}:project/*`],
      })
    );

    // IAM Role for the feature branch AWS CodeBuild project.
    const codeBuildRole = new Role(this, "CodeBuildExecutionRole", {
      assumedBy: new ServicePrincipal("codebuild.amazonaws.com"),
    });

    codeBuildRole.addToPolicy(
      new PolicyStatement({
        actions: [
          "cloudformation:DescribeStacks",
          "cloudformation:DeleteStack",
        ],
        resources: [
          `arn:aws:cloudformation:${region}:${devAccountId}:stack/*/*`,
        ],
      })
    );

    codeBuildRole.addToPolicy(
      new PolicyStatement({
        actions: [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
        ],
        resources: [
          `arn:aws:logs:${region}:${devAccountId}:log-group:/aws/codebuild/${codebuildPrefix}-*`,
          `arn:aws:logs:${region}:${devAccountId}:log-group:/aws/codebuild/${codebuildPrefix}-*:*`,
        ],
      })
    );

    codeBuildRole.addToPolicy(
      new PolicyStatement({
        actions: ["codestar-connections:UseConnection"],
        resources: [connectionArn],
      })
    );

    codeBuildRole.addToPolicy(
      new PolicyStatement({
        actions: [
          "s3:DeleteObject",
          "s3:PutObject",
          "s3:GetObject",
          "s3:ListBucket",
        ],
        resources: [`${artifactBucketArn}/*`, `${artifactBucketArn}`],
      })
    );

    codeBuildRole.addToPolicy(
      new PolicyStatement({
        actions: ["sts:AssumeRole"],
        resources: [`arn:*:iam::${devAccountId}:role/*`],
        conditions: {
          "ForAnyValue:StringEquals": {
            "iam:ResourceTag/aws-cdk:bootstrap-role": [
              "image-publishing",
              "file-publishing",
              "deploy",
            ],
          },
        },
      })
    );

    createBranchRole.addToPolicy(
      new PolicyStatement({
        actions: ["iam:PassRole"],
        resources: [codeBuildRole.roleArn],
      })
    );

    deleteBranchRole.addToPolicy(
      new PolicyStatement({
        actions: ["iam:PassRole"],
        resources: [codeBuildRole.roleArn],
      })
    );

    this.createBranchRole = createBranchRole;
    this.deleteBranchRole = deleteBranchRole;
    this.codeBuildRole = codeBuildRole;
  }
}
