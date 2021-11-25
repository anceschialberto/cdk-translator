/* eslint-disable @typescript-eslint/no-unsafe-call */

import {
  expect as expectCDK,
  matchTemplate,
  MatchStyle,
} from "@aws-cdk/assert";
import * as cdk from "@aws-cdk/core";
import * as Pipeline from "../lib/pipeline-stack";

test("Empty Stack", () => {
  const app = new cdk.App();
  // WHEN
  const stack = new Pipeline.PipelineStack(app, "MyTestStack");
  // THEN
  expectCDK(stack).to(
    matchTemplate(
      {
        Resources: {
          ArtifactsBucket2AAC5544: {
            Type: "AWS::S3::Bucket",
            UpdateReplacePolicy: "Retain",
            DeletionPolicy: "Retain",
          },
          PipelineRoleD68726F7: {
            Type: "AWS::IAM::Role",
            Properties: {
              AssumeRolePolicyDocument: {
                Statement: [
                  {
                    Action: "sts:AssumeRole",
                    Effect: "Allow",
                    Principal: {
                      Service: "codepipeline.amazonaws.com",
                    },
                  },
                ],
                Version: "2012-10-17",
              },
            },
          },
          PipelineRoleDefaultPolicyC7A05455: {
            Type: "AWS::IAM::Policy",
            Properties: {
              PolicyDocument: {
                Statement: [
                  {
                    Action: [
                      "s3:GetObject*",
                      "s3:GetBucket*",
                      "s3:List*",
                      "s3:DeleteObject*",
                      "s3:PutObject*",
                      "s3:Abort*",
                    ],
                    Effect: "Allow",
                    Resource: [
                      {
                        "Fn::GetAtt": ["ArtifactsBucket2AAC5544", "Arn"],
                      },
                      {
                        "Fn::Join": [
                          "",
                          [
                            {
                              "Fn::GetAtt": ["ArtifactsBucket2AAC5544", "Arn"],
                            },
                            "/*",
                          ],
                        ],
                      },
                    ],
                  },
                  {
                    Action: "sts:AssumeRole",
                    Effect: "Allow",
                    Resource: {
                      "Fn::GetAtt": [
                        "PipelineBuildCodePipelineActionRoleD77A08E6",
                        "Arn",
                      ],
                    },
                  },
                  {
                    Action: "sts:AssumeRole",
                    Effect: "Allow",
                    Resource: {
                      "Fn::GetAtt": [
                        "PipelineDevCreateChangeSetCodePipelineActionRole5BF56050",
                        "Arn",
                      ],
                    },
                  },
                  {
                    Action: "sts:AssumeRole",
                    Effect: "Allow",
                    Resource: {
                      "Fn::GetAtt": [
                        "PipelineDevDeployCodePipelineActionRoleF791317A",
                        "Arn",
                      ],
                    },
                  },
                ],
                Version: "2012-10-17",
              },
              PolicyName: "PipelineRoleDefaultPolicyC7A05455",
              Roles: [
                {
                  Ref: "PipelineRoleD68726F7",
                },
              ],
            },
          },
          PipelineC660917D: {
            Type: "AWS::CodePipeline::Pipeline",
            Properties: {
              RoleArn: {
                "Fn::GetAtt": ["PipelineRoleD68726F7", "Arn"],
              },
              Stages: [
                {
                  Actions: [
                    {
                      ActionTypeId: {
                        Category: "Source",
                        Owner: "ThirdParty",
                        Provider: "GitHub",
                        Version: "1",
                      },
                      Configuration: {
                        Owner: "anceschialberto",
                        Repo: "cdk-translator",
                        Branch: "main",
                        OAuthToken:
                          "{{resolve:secretsmanager:my-github-token:SecretString:::}}",
                        PollForSourceChanges: false,
                      },
                      Name: "GitHub_Source",
                      OutputArtifacts: [
                        {
                          Name: "Artifact_Source_GitHub_Source",
                        },
                      ],
                      RunOrder: 1,
                    },
                  ],
                  Name: "Source",
                },
                {
                  Actions: [
                    {
                      ActionTypeId: {
                        Category: "Build",
                        Owner: "AWS",
                        Provider: "CodeBuild",
                        Version: "1",
                      },
                      Configuration: {
                        ProjectName: {
                          Ref: "Build45A36621",
                        },
                      },
                      InputArtifacts: [
                        {
                          Name: "Artifact_Source_GitHub_Source",
                        },
                      ],
                      Name: "Build",
                      OutputArtifacts: [
                        {
                          Name: "Artifact_Build_Build",
                        },
                      ],
                      RoleArn: {
                        "Fn::GetAtt": [
                          "PipelineBuildCodePipelineActionRoleD77A08E6",
                          "Arn",
                        ],
                      },
                      RunOrder: 1,
                    },
                  ],
                  Name: "Build",
                },
                {
                  Actions: [
                    {
                      ActionTypeId: {
                        Category: "Deploy",
                        Owner: "AWS",
                        Provider: "CloudFormation",
                        Version: "1",
                      },
                      Configuration: {
                        StackName: "CdkDayStack",
                        Capabilities: "CAPABILITY_NAMED_IAM",
                        RoleArn: {
                          "Fn::GetAtt": [
                            "PipelineDevCreateChangeSetRoleFFC4CBBE",
                            "Arn",
                          ],
                        },
                        ActionMode: "CHANGE_SET_REPLACE",
                        ChangeSetName: "CdkDayStack-dev-changeset",
                        TemplatePath: "Artifact_Build_Build::packaged.yaml",
                      },
                      InputArtifacts: [
                        {
                          Name: "Artifact_Build_Build",
                        },
                      ],
                      Name: "CreateChangeSet",
                      RoleArn: {
                        "Fn::GetAtt": [
                          "PipelineDevCreateChangeSetCodePipelineActionRole5BF56050",
                          "Arn",
                        ],
                      },
                      RunOrder: 1,
                    },
                    {
                      ActionTypeId: {
                        Category: "Deploy",
                        Owner: "AWS",
                        Provider: "CloudFormation",
                        Version: "1",
                      },
                      Configuration: {
                        StackName: "CdkDayStack",
                        ActionMode: "CHANGE_SET_EXECUTE",
                        ChangeSetName: "CdkDayStack-dev-changeset",
                      },
                      Name: "Deploy",
                      RoleArn: {
                        "Fn::GetAtt": [
                          "PipelineDevDeployCodePipelineActionRoleF791317A",
                          "Arn",
                        ],
                      },
                      RunOrder: 2,
                    },
                  ],
                  Name: "Dev",
                },
              ],
              ArtifactStore: {
                Location: {
                  Ref: "ArtifactsBucket2AAC5544",
                },
                Type: "S3",
              },
            },
            DependsOn: [
              "PipelineRoleDefaultPolicyC7A05455",
              "PipelineRoleD68726F7",
            ],
          },
          PipelineSourceGitHubSourceWebhookResource8EECEFFF: {
            Type: "AWS::CodePipeline::Webhook",
            Properties: {
              Authentication: "GITHUB_HMAC",
              AuthenticationConfiguration: {
                SecretToken:
                  "{{resolve:secretsmanager:my-github-token:SecretString:::}}",
              },
              Filters: [
                {
                  JsonPath: "$.ref",
                  MatchEquals: "refs/heads/{Branch}",
                },
              ],
              TargetAction: "GitHub_Source",
              TargetPipeline: {
                Ref: "PipelineC660917D",
              },
              TargetPipelineVersion: 1,
              RegisterWithThirdParty: true,
            },
          },
          PipelineBuildCodePipelineActionRoleD77A08E6: {
            Type: "AWS::IAM::Role",
            Properties: {
              AssumeRolePolicyDocument: {
                Statement: [
                  {
                    Action: "sts:AssumeRole",
                    Effect: "Allow",
                    Principal: {
                      AWS: {
                        "Fn::Join": [
                          "",
                          [
                            "arn:",
                            {
                              Ref: "AWS::Partition",
                            },
                            ":iam::",
                            {
                              Ref: "AWS::AccountId",
                            },
                            ":root",
                          ],
                        ],
                      },
                    },
                  },
                ],
                Version: "2012-10-17",
              },
            },
          },
          PipelineBuildCodePipelineActionRoleDefaultPolicyC9CB73F8: {
            Type: "AWS::IAM::Policy",
            Properties: {
              PolicyDocument: {
                Statement: [
                  {
                    Action: [
                      "codebuild:BatchGetBuilds",
                      "codebuild:StartBuild",
                      "codebuild:StopBuild",
                    ],
                    Effect: "Allow",
                    Resource: {
                      "Fn::GetAtt": ["Build45A36621", "Arn"],
                    },
                  },
                ],
                Version: "2012-10-17",
              },
              PolicyName:
                "PipelineBuildCodePipelineActionRoleDefaultPolicyC9CB73F8",
              Roles: [
                {
                  Ref: "PipelineBuildCodePipelineActionRoleD77A08E6",
                },
              ],
            },
          },
          PipelineDevCreateChangeSetCodePipelineActionRole5BF56050: {
            Type: "AWS::IAM::Role",
            Properties: {
              AssumeRolePolicyDocument: {
                Statement: [
                  {
                    Action: "sts:AssumeRole",
                    Effect: "Allow",
                    Principal: {
                      AWS: {
                        "Fn::Join": [
                          "",
                          [
                            "arn:",
                            {
                              Ref: "AWS::Partition",
                            },
                            ":iam::",
                            {
                              Ref: "AWS::AccountId",
                            },
                            ":root",
                          ],
                        ],
                      },
                    },
                  },
                ],
                Version: "2012-10-17",
              },
            },
          },
          PipelineDevCreateChangeSetCodePipelineActionRoleDefaultPolicy560ECE93:
            {
              Type: "AWS::IAM::Policy",
              Properties: {
                PolicyDocument: {
                  Statement: [
                    {
                      Action: "iam:PassRole",
                      Effect: "Allow",
                      Resource: {
                        "Fn::GetAtt": [
                          "PipelineDevCreateChangeSetRoleFFC4CBBE",
                          "Arn",
                        ],
                      },
                    },
                    {
                      Action: ["s3:GetObject*", "s3:GetBucket*", "s3:List*"],
                      Effect: "Allow",
                      Resource: [
                        {
                          "Fn::GetAtt": ["ArtifactsBucket2AAC5544", "Arn"],
                        },
                        {
                          "Fn::Join": [
                            "",
                            [
                              {
                                "Fn::GetAtt": [
                                  "ArtifactsBucket2AAC5544",
                                  "Arn",
                                ],
                              },
                              "/*",
                            ],
                          ],
                        },
                      ],
                    },
                    {
                      Action: [
                        "cloudformation:CreateChangeSet",
                        "cloudformation:DeleteChangeSet",
                        "cloudformation:DescribeChangeSet",
                        "cloudformation:DescribeStacks",
                      ],
                      Condition: {
                        StringEqualsIfExists: {
                          "cloudformation:ChangeSetName":
                            "CdkDayStack-dev-changeset",
                        },
                      },
                      Effect: "Allow",
                      Resource: {
                        "Fn::Join": [
                          "",
                          [
                            "arn:",
                            {
                              Ref: "AWS::Partition",
                            },
                            ":cloudformation:",
                            {
                              Ref: "AWS::Region",
                            },
                            ":",
                            {
                              Ref: "AWS::AccountId",
                            },
                            ":stack/CdkDayStack/*",
                          ],
                        ],
                      },
                    },
                  ],
                  Version: "2012-10-17",
                },
                PolicyName:
                  "PipelineDevCreateChangeSetCodePipelineActionRoleDefaultPolicy560ECE93",
                Roles: [
                  {
                    Ref: "PipelineDevCreateChangeSetCodePipelineActionRole5BF56050",
                  },
                ],
              },
            },
          PipelineDevCreateChangeSetRoleFFC4CBBE: {
            Type: "AWS::IAM::Role",
            Properties: {
              AssumeRolePolicyDocument: {
                Statement: [
                  {
                    Action: "sts:AssumeRole",
                    Effect: "Allow",
                    Principal: {
                      Service: "cloudformation.amazonaws.com",
                    },
                  },
                ],
                Version: "2012-10-17",
              },
            },
          },
          PipelineDevCreateChangeSetRoleDefaultPolicy9C56B345: {
            Type: "AWS::IAM::Policy",
            Properties: {
              PolicyDocument: {
                Statement: [
                  {
                    Action: ["s3:GetObject*", "s3:GetBucket*", "s3:List*"],
                    Effect: "Allow",
                    Resource: [
                      {
                        "Fn::GetAtt": ["ArtifactsBucket2AAC5544", "Arn"],
                      },
                      {
                        "Fn::Join": [
                          "",
                          [
                            {
                              "Fn::GetAtt": ["ArtifactsBucket2AAC5544", "Arn"],
                            },
                            "/*",
                          ],
                        ],
                      },
                    ],
                  },
                  {
                    Action: "*",
                    Effect: "Allow",
                    Resource: "*",
                  },
                ],
                Version: "2012-10-17",
              },
              PolicyName: "PipelineDevCreateChangeSetRoleDefaultPolicy9C56B345",
              Roles: [
                {
                  Ref: "PipelineDevCreateChangeSetRoleFFC4CBBE",
                },
              ],
            },
          },
          PipelineDevDeployCodePipelineActionRoleF791317A: {
            Type: "AWS::IAM::Role",
            Properties: {
              AssumeRolePolicyDocument: {
                Statement: [
                  {
                    Action: "sts:AssumeRole",
                    Effect: "Allow",
                    Principal: {
                      AWS: {
                        "Fn::Join": [
                          "",
                          [
                            "arn:",
                            {
                              Ref: "AWS::Partition",
                            },
                            ":iam::",
                            {
                              Ref: "AWS::AccountId",
                            },
                            ":root",
                          ],
                        ],
                      },
                    },
                  },
                ],
                Version: "2012-10-17",
              },
            },
          },
          PipelineDevDeployCodePipelineActionRoleDefaultPolicy0025FF20: {
            Type: "AWS::IAM::Policy",
            Properties: {
              PolicyDocument: {
                Statement: [
                  {
                    Action: [
                      "cloudformation:DescribeChangeSet",
                      "cloudformation:DescribeStacks",
                      "cloudformation:ExecuteChangeSet",
                    ],
                    Condition: {
                      StringEqualsIfExists: {
                        "cloudformation:ChangeSetName":
                          "CdkDayStack-dev-changeset",
                      },
                    },
                    Effect: "Allow",
                    Resource: {
                      "Fn::Join": [
                        "",
                        [
                          "arn:",
                          {
                            Ref: "AWS::Partition",
                          },
                          ":cloudformation:",
                          {
                            Ref: "AWS::Region",
                          },
                          ":",
                          {
                            Ref: "AWS::AccountId",
                          },
                          ":stack/CdkDayStack/*",
                        ],
                      ],
                    },
                  },
                ],
                Version: "2012-10-17",
              },
              PolicyName:
                "PipelineDevDeployCodePipelineActionRoleDefaultPolicy0025FF20",
              Roles: [
                {
                  Ref: "PipelineDevDeployCodePipelineActionRoleF791317A",
                },
              ],
            },
          },
          BuildRoleB7C66CB2: {
            Type: "AWS::IAM::Role",
            Properties: {
              AssumeRolePolicyDocument: {
                Statement: [
                  {
                    Action: "sts:AssumeRole",
                    Effect: "Allow",
                    Principal: {
                      Service: "codebuild.amazonaws.com",
                    },
                  },
                ],
                Version: "2012-10-17",
              },
            },
          },
          BuildRoleDefaultPolicyEAC4E6D6: {
            Type: "AWS::IAM::Policy",
            Properties: {
              PolicyDocument: {
                Statement: [
                  {
                    Action: [
                      "logs:CreateLogGroup",
                      "logs:CreateLogStream",
                      "logs:PutLogEvents",
                    ],
                    Effect: "Allow",
                    Resource: [
                      {
                        "Fn::Join": [
                          "",
                          [
                            "arn:",
                            {
                              Ref: "AWS::Partition",
                            },
                            ":logs:",
                            {
                              Ref: "AWS::Region",
                            },
                            ":",
                            {
                              Ref: "AWS::AccountId",
                            },
                            ":log-group:/aws/codebuild/",
                            {
                              Ref: "Build45A36621",
                            },
                          ],
                        ],
                      },
                      {
                        "Fn::Join": [
                          "",
                          [
                            "arn:",
                            {
                              Ref: "AWS::Partition",
                            },
                            ":logs:",
                            {
                              Ref: "AWS::Region",
                            },
                            ":",
                            {
                              Ref: "AWS::AccountId",
                            },
                            ":log-group:/aws/codebuild/",
                            {
                              Ref: "Build45A36621",
                            },
                            ":*",
                          ],
                        ],
                      },
                    ],
                  },
                  {
                    Action: [
                      "codebuild:CreateReportGroup",
                      "codebuild:CreateReport",
                      "codebuild:UpdateReport",
                      "codebuild:BatchPutTestCases",
                      "codebuild:BatchPutCodeCoverages",
                    ],
                    Effect: "Allow",
                    Resource: {
                      "Fn::Join": [
                        "",
                        [
                          "arn:",
                          {
                            Ref: "AWS::Partition",
                          },
                          ":codebuild:",
                          {
                            Ref: "AWS::Region",
                          },
                          ":",
                          {
                            Ref: "AWS::AccountId",
                          },
                          ":report-group/",
                          {
                            Ref: "Build45A36621",
                          },
                          "-*",
                        ],
                      ],
                    },
                  },
                  {
                    Action: [
                      "s3:GetObject*",
                      "s3:GetBucket*",
                      "s3:List*",
                      "s3:DeleteObject*",
                      "s3:PutObject*",
                      "s3:Abort*",
                    ],
                    Effect: "Allow",
                    Resource: [
                      {
                        "Fn::GetAtt": ["ArtifactsBucket2AAC5544", "Arn"],
                      },
                      {
                        "Fn::Join": [
                          "",
                          [
                            {
                              "Fn::GetAtt": ["ArtifactsBucket2AAC5544", "Arn"],
                            },
                            "/*",
                          ],
                        ],
                      },
                    ],
                  },
                ],
                Version: "2012-10-17",
              },
              PolicyName: "BuildRoleDefaultPolicyEAC4E6D6",
              Roles: [
                {
                  Ref: "BuildRoleB7C66CB2",
                },
              ],
            },
          },
          Build45A36621: {
            Type: "AWS::CodeBuild::Project",
            Properties: {
              Artifacts: {
                Type: "CODEPIPELINE",
              },
              Environment: {
                ComputeType: "BUILD_GENERAL1_SMALL",
                EnvironmentVariables: [
                  {
                    Name: "PACKAGE_BUCKET",
                    Type: "PLAINTEXT",
                    Value: {
                      Ref: "ArtifactsBucket2AAC5544",
                    },
                  },
                ],
                Image: "aws/codebuild/amazonlinux2-x86_64-standard:3.0",
                ImagePullCredentialsType: "CODEBUILD",
                PrivilegedMode: false,
                Type: "LINUX_CONTAINER",
              },
              ServiceRole: {
                "Fn::GetAtt": ["BuildRoleB7C66CB2", "Arn"],
              },
              Source: {
                Type: "CODEPIPELINE",
              },
              EncryptionKey: "alias/aws/s3",
            },
          },
        },
      },
      MatchStyle.EXACT
    )
  );
});
