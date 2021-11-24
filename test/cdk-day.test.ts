/* eslint-disable @typescript-eslint/no-unsafe-call */

import {
  expect as expectCDK,
  matchTemplate,
  MatchStyle,
} from "@aws-cdk/assert";
import * as cdk from "@aws-cdk/core";
import * as CdkDay from "../lib/cdk-day-stack";

test("Empty Stack", () => {
  const app = new cdk.App();
  // WHEN
  const stack = new CdkDay.CdkDayStack(app, "MyTestStack");
  // THEN
  expectCDK(stack).to(
    matchTemplate(
      {
        Resources: {
          TranslateTable1ABF9811: {
            Type: "AWS::DynamoDB::Table",
            Properties: {
              KeySchema: [
                {
                  AttributeName: "id",
                  KeyType: "HASH",
                },
                {
                  AttributeName: "language",
                  KeyType: "RANGE",
                },
              ],
              AttributeDefinitions: [
                {
                  AttributeName: "id",
                  AttributeType: "S",
                },
                {
                  AttributeName: "language",
                  AttributeType: "S",
                },
              ],
              ProvisionedThroughput: {
                ReadCapacityUnits: 5,
                WriteCapacityUnits: 5,
              },
            },
            UpdateReplacePolicy: "Retain",
            DeletionPolicy: "Retain",
          },
          TranslateBus46D6DDAA: {
            Type: "AWS::Events::EventBus",
            Properties: {
              Name: "TranslateBus",
            },
          },
          PutTranslationFunctionServiceRoleE038FB93: {
            Type: "AWS::IAM::Role",
            Properties: {
              AssumeRolePolicyDocument: {
                Statement: [
                  {
                    Action: "sts:AssumeRole",
                    Effect: "Allow",
                    Principal: {
                      Service: "lambda.amazonaws.com",
                    },
                  },
                ],
                Version: "2012-10-17",
              },
              ManagedPolicyArns: [
                {
                  "Fn::Join": [
                    "",
                    [
                      "arn:",
                      {
                        Ref: "AWS::Partition",
                      },
                      ":iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
                    ],
                  ],
                },
              ],
            },
          },
          PutTranslationFunctionServiceRoleDefaultPolicyB878D483: {
            Type: "AWS::IAM::Policy",
            Properties: {
              PolicyDocument: {
                Statement: [
                  {
                    Action: "events:PutEvents",
                    Effect: "Allow",
                    Resource: {
                      "Fn::GetAtt": ["TranslateBus46D6DDAA", "Arn"],
                    },
                  },
                ],
                Version: "2012-10-17",
              },
              PolicyName:
                "PutTranslationFunctionServiceRoleDefaultPolicyB878D483",
              Roles: [
                {
                  Ref: "PutTranslationFunctionServiceRoleE038FB93",
                },
              ],
            },
          },
          PutTranslationFunction9E955411: {
            Type: "AWS::Lambda::Function",
            Properties: {
              Code: {
                S3Bucket: {
                  Ref: "AssetParameters39c2c0999a8734651990fd4a93ba8169bf86efa3d514b4dfa5f25aaf0ba6d2a3S3Bucket6609F7B2",
                },
                S3Key: {
                  "Fn::Join": [
                    "",
                    [
                      {
                        "Fn::Select": [
                          0,
                          {
                            "Fn::Split": [
                              "||",
                              {
                                Ref: "AssetParameters39c2c0999a8734651990fd4a93ba8169bf86efa3d514b4dfa5f25aaf0ba6d2a3S3VersionKey260F0E9B",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        "Fn::Select": [
                          1,
                          {
                            "Fn::Split": [
                              "||",
                              {
                                Ref: "AssetParameters39c2c0999a8734651990fd4a93ba8169bf86efa3d514b4dfa5f25aaf0ba6d2a3S3VersionKey260F0E9B",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  ],
                },
              },
              Role: {
                "Fn::GetAtt": [
                  "PutTranslationFunctionServiceRoleE038FB93",
                  "Arn",
                ],
              },
              Environment: {
                Variables: {
                  TRANSLATE_BUS: {
                    Ref: "TranslateBus46D6DDAA",
                  },
                  AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
                },
              },
              Handler: "index.handler",
              Runtime: "nodejs14.x",
            },
            DependsOn: [
              "PutTranslationFunctionServiceRoleDefaultPolicyB878D483",
              "PutTranslationFunctionServiceRoleE038FB93",
            ],
          },
          PutTranslatePolicyB54B2023: {
            Type: "AWS::IAM::Policy",
            Properties: {
              PolicyDocument: {
                Statement: [
                  {
                    Action: "translate:TranslateText",
                    Effect: "Allow",
                    Resource: "*",
                  },
                ],
                Version: "2012-10-17",
              },
              PolicyName: "PutTranslatePolicyB54B2023",
              Roles: [
                {
                  Ref: "PutTranslationFunctionServiceRoleE038FB93",
                },
              ],
            },
          },
          GetTranslationFunctionServiceRole408CD69C: {
            Type: "AWS::IAM::Role",
            Properties: {
              AssumeRolePolicyDocument: {
                Statement: [
                  {
                    Action: "sts:AssumeRole",
                    Effect: "Allow",
                    Principal: {
                      Service: "lambda.amazonaws.com",
                    },
                  },
                ],
                Version: "2012-10-17",
              },
              ManagedPolicyArns: [
                {
                  "Fn::Join": [
                    "",
                    [
                      "arn:",
                      {
                        Ref: "AWS::Partition",
                      },
                      ":iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
                    ],
                  ],
                },
              ],
            },
          },
          GetTranslationFunctionServiceRoleDefaultPolicy7862AC6E: {
            Type: "AWS::IAM::Policy",
            Properties: {
              PolicyDocument: {
                Statement: [
                  {
                    Action: [
                      "dynamodb:BatchGetItem",
                      "dynamodb:GetRecords",
                      "dynamodb:GetShardIterator",
                      "dynamodb:Query",
                      "dynamodb:GetItem",
                      "dynamodb:Scan",
                      "dynamodb:ConditionCheckItem",
                    ],
                    Effect: "Allow",
                    Resource: [
                      {
                        "Fn::GetAtt": ["TranslateTable1ABF9811", "Arn"],
                      },
                      {
                        Ref: "AWS::NoValue",
                      },
                    ],
                  },
                ],
                Version: "2012-10-17",
              },
              PolicyName:
                "GetTranslationFunctionServiceRoleDefaultPolicy7862AC6E",
              Roles: [
                {
                  Ref: "GetTranslationFunctionServiceRole408CD69C",
                },
              ],
            },
          },
          GetTranslationFunction0677F2E3: {
            Type: "AWS::Lambda::Function",
            Properties: {
              Code: {
                S3Bucket: {
                  Ref: "AssetParameters5f4c7471f721131443c47de4c4bb141ec7e2e8be920127770bba2529a9dd2ba0S3Bucket8FA7C1C2",
                },
                S3Key: {
                  "Fn::Join": [
                    "",
                    [
                      {
                        "Fn::Select": [
                          0,
                          {
                            "Fn::Split": [
                              "||",
                              {
                                Ref: "AssetParameters5f4c7471f721131443c47de4c4bb141ec7e2e8be920127770bba2529a9dd2ba0S3VersionKey989DEDF0",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        "Fn::Select": [
                          1,
                          {
                            "Fn::Split": [
                              "||",
                              {
                                Ref: "AssetParameters5f4c7471f721131443c47de4c4bb141ec7e2e8be920127770bba2529a9dd2ba0S3VersionKey989DEDF0",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  ],
                },
              },
              Role: {
                "Fn::GetAtt": [
                  "GetTranslationFunctionServiceRole408CD69C",
                  "Arn",
                ],
              },
              Environment: {
                Variables: {
                  TRANSLATE_TABLE: {
                    Ref: "TranslateTable1ABF9811",
                  },
                  AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
                },
              },
              Handler: "index.handler",
              Runtime: "nodejs14.x",
            },
            DependsOn: [
              "GetTranslationFunctionServiceRoleDefaultPolicy7862AC6E",
              "GetTranslationFunctionServiceRole408CD69C",
            ],
          },
          SaveTranslationFunctionServiceRoleDCF57C08: {
            Type: "AWS::IAM::Role",
            Properties: {
              AssumeRolePolicyDocument: {
                Statement: [
                  {
                    Action: "sts:AssumeRole",
                    Effect: "Allow",
                    Principal: {
                      Service: "lambda.amazonaws.com",
                    },
                  },
                ],
                Version: "2012-10-17",
              },
              ManagedPolicyArns: [
                {
                  "Fn::Join": [
                    "",
                    [
                      "arn:",
                      {
                        Ref: "AWS::Partition",
                      },
                      ":iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
                    ],
                  ],
                },
              ],
            },
          },
          SaveTranslationFunctionServiceRoleDefaultPolicyE1167723: {
            Type: "AWS::IAM::Policy",
            Properties: {
              PolicyDocument: {
                Statement: [
                  {
                    Action: [
                      "dynamodb:BatchWriteItem",
                      "dynamodb:PutItem",
                      "dynamodb:UpdateItem",
                      "dynamodb:DeleteItem",
                    ],
                    Effect: "Allow",
                    Resource: [
                      {
                        "Fn::GetAtt": ["TranslateTable1ABF9811", "Arn"],
                      },
                      {
                        Ref: "AWS::NoValue",
                      },
                    ],
                  },
                ],
                Version: "2012-10-17",
              },
              PolicyName:
                "SaveTranslationFunctionServiceRoleDefaultPolicyE1167723",
              Roles: [
                {
                  Ref: "SaveTranslationFunctionServiceRoleDCF57C08",
                },
              ],
            },
          },
          SaveTranslationFunctionD9E440D6: {
            Type: "AWS::Lambda::Function",
            Properties: {
              Code: {
                S3Bucket: {
                  Ref: "AssetParameters8342a54425e548c75603c60c957c6bc45924b3e156044255df6d971e49d59cb0S3BucketC324531E",
                },
                S3Key: {
                  "Fn::Join": [
                    "",
                    [
                      {
                        "Fn::Select": [
                          0,
                          {
                            "Fn::Split": [
                              "||",
                              {
                                Ref: "AssetParameters8342a54425e548c75603c60c957c6bc45924b3e156044255df6d971e49d59cb0S3VersionKey17F471E8",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        "Fn::Select": [
                          1,
                          {
                            "Fn::Split": [
                              "||",
                              {
                                Ref: "AssetParameters8342a54425e548c75603c60c957c6bc45924b3e156044255df6d971e49d59cb0S3VersionKey17F471E8",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  ],
                },
              },
              Role: {
                "Fn::GetAtt": [
                  "SaveTranslationFunctionServiceRoleDCF57C08",
                  "Arn",
                ],
              },
              Environment: {
                Variables: {
                  TRANSLATE_TABLE: {
                    Ref: "TranslateTable1ABF9811",
                  },
                  AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
                },
              },
              Handler: "index.handler",
              Runtime: "nodejs14.x",
            },
            DependsOn: [
              "SaveTranslationFunctionServiceRoleDefaultPolicyE1167723",
              "SaveTranslationFunctionServiceRoleDCF57C08",
            ],
          },
          SaveTranslationFunctionAllowEventRuleMyTestStackSaveTranslationRule300A7F3A369671E8:
            {
              Type: "AWS::Lambda::Permission",
              Properties: {
                Action: "lambda:InvokeFunction",
                FunctionName: {
                  "Fn::GetAtt": ["SaveTranslationFunctionD9E440D6", "Arn"],
                },
                Principal: "events.amazonaws.com",
                SourceArn: {
                  "Fn::GetAtt": ["SaveTranslationRule77BFC15F", "Arn"],
                },
              },
            },
          SaveTranslationRule77BFC15F: {
            Type: "AWS::Events::Rule",
            Properties: {
              EventBusName: {
                Ref: "TranslateBus46D6DDAA",
              },
              EventPattern: {
                "detail-type": ["translation"],
              },
              State: "ENABLED",
              Targets: [
                {
                  Arn: {
                    "Fn::GetAtt": ["SaveTranslationFunctionD9E440D6", "Arn"],
                  },
                  Id: "Target0",
                },
              ],
            },
          },
          TranslateAPI19A43816: {
            Type: "AWS::ApiGatewayV2::Api",
            Properties: {
              Name: "TranslateAPI",
              ProtocolType: "HTTP",
            },
          },
          TranslateAPIDefaultStage3BDD98F9: {
            Type: "AWS::ApiGatewayV2::Stage",
            Properties: {
              ApiId: {
                Ref: "TranslateAPI19A43816",
              },
              StageName: "$default",
              AutoDeploy: true,
            },
          },
          TranslateAPIPOSTMyTestStackTranslateAPIPOST2CD91B72Permission7EBB92A0:
            {
              Type: "AWS::Lambda::Permission",
              Properties: {
                Action: "lambda:InvokeFunction",
                FunctionName: {
                  "Fn::GetAtt": ["PutTranslationFunction9E955411", "Arn"],
                },
                Principal: "apigateway.amazonaws.com",
                SourceArn: {
                  "Fn::Join": [
                    "",
                    [
                      "arn:",
                      {
                        Ref: "AWS::Partition",
                      },
                      ":execute-api:",
                      {
                        Ref: "AWS::Region",
                      },
                      ":",
                      {
                        Ref: "AWS::AccountId",
                      },
                      ":",
                      {
                        Ref: "TranslateAPI19A43816",
                      },
                      "/*/*/",
                    ],
                  ],
                },
              },
            },
          TranslateAPIPOSTHttpIntegration8710e6b71ff5c67e39e9b5b40fe39dbaEFCE3F57:
            {
              Type: "AWS::ApiGatewayV2::Integration",
              Properties: {
                ApiId: {
                  Ref: "TranslateAPI19A43816",
                },
                IntegrationType: "AWS_PROXY",
                IntegrationUri: {
                  "Fn::GetAtt": ["PutTranslationFunction9E955411", "Arn"],
                },
                PayloadFormatVersion: "2.0",
              },
            },
          TranslateAPIPOSTD32A2B26: {
            Type: "AWS::ApiGatewayV2::Route",
            Properties: {
              ApiId: {
                Ref: "TranslateAPI19A43816",
              },
              RouteKey: "POST /",
              AuthorizationType: "NONE",
              Target: {
                "Fn::Join": [
                  "",
                  [
                    "integrations/",
                    {
                      Ref: "TranslateAPIPOSTHttpIntegration8710e6b71ff5c67e39e9b5b40fe39dbaEFCE3F57",
                    },
                  ],
                ],
              },
            },
          },
          TranslateAPIGETidMyTestStackTranslateAPIGETid943911D2PermissionE55907F1:
            {
              Type: "AWS::Lambda::Permission",
              Properties: {
                Action: "lambda:InvokeFunction",
                FunctionName: {
                  "Fn::GetAtt": ["GetTranslationFunction0677F2E3", "Arn"],
                },
                Principal: "apigateway.amazonaws.com",
                SourceArn: {
                  "Fn::Join": [
                    "",
                    [
                      "arn:",
                      {
                        Ref: "AWS::Partition",
                      },
                      ":execute-api:",
                      {
                        Ref: "AWS::Region",
                      },
                      ":",
                      {
                        Ref: "AWS::AccountId",
                      },
                      ":",
                      {
                        Ref: "TranslateAPI19A43816",
                      },
                      "/*/*/{id}",
                    ],
                  ],
                },
              },
            },
          TranslateAPIGETidHttpIntegration880cc39dcb422e77f6801a8ce2294b073770B841:
            {
              Type: "AWS::ApiGatewayV2::Integration",
              Properties: {
                ApiId: {
                  Ref: "TranslateAPI19A43816",
                },
                IntegrationType: "AWS_PROXY",
                IntegrationUri: {
                  "Fn::GetAtt": ["GetTranslationFunction0677F2E3", "Arn"],
                },
                PayloadFormatVersion: "2.0",
              },
            },
          TranslateAPIGETid45762B1E: {
            Type: "AWS::ApiGatewayV2::Route",
            Properties: {
              ApiId: {
                Ref: "TranslateAPI19A43816",
              },
              RouteKey: "GET /{id}",
              AuthorizationType: "NONE",
              Target: {
                "Fn::Join": [
                  "",
                  [
                    "integrations/",
                    {
                      Ref: "TranslateAPIGETidHttpIntegration880cc39dcb422e77f6801a8ce2294b073770B841",
                    },
                  ],
                ],
              },
            },
          },
          TranslateAPIGETMyTestStackTranslateAPIGET2DF88251PermissionB4665F91: {
            Type: "AWS::Lambda::Permission",
            Properties: {
              Action: "lambda:InvokeFunction",
              FunctionName: {
                "Fn::GetAtt": ["GetTranslationFunction0677F2E3", "Arn"],
              },
              Principal: "apigateway.amazonaws.com",
              SourceArn: {
                "Fn::Join": [
                  "",
                  [
                    "arn:",
                    {
                      Ref: "AWS::Partition",
                    },
                    ":execute-api:",
                    {
                      Ref: "AWS::Region",
                    },
                    ":",
                    {
                      Ref: "AWS::AccountId",
                    },
                    ":",
                    {
                      Ref: "TranslateAPI19A43816",
                    },
                    "/*/*/",
                  ],
                ],
              },
            },
          },
          TranslateAPIGET71FB00DE: {
            Type: "AWS::ApiGatewayV2::Route",
            Properties: {
              ApiId: {
                Ref: "TranslateAPI19A43816",
              },
              RouteKey: "GET /",
              AuthorizationType: "NONE",
              Target: {
                "Fn::Join": [
                  "",
                  [
                    "integrations/",
                    {
                      Ref: "TranslateAPIGETidHttpIntegration880cc39dcb422e77f6801a8ce2294b073770B841",
                    },
                  ],
                ],
              },
            },
          },
        },
        Parameters: {
          AssetParameters39c2c0999a8734651990fd4a93ba8169bf86efa3d514b4dfa5f25aaf0ba6d2a3S3Bucket6609F7B2:
            {
              Type: "String",
              Description:
                'S3 bucket for asset "39c2c0999a8734651990fd4a93ba8169bf86efa3d514b4dfa5f25aaf0ba6d2a3"',
            },
          AssetParameters39c2c0999a8734651990fd4a93ba8169bf86efa3d514b4dfa5f25aaf0ba6d2a3S3VersionKey260F0E9B:
            {
              Type: "String",
              Description:
                'S3 key for asset version "39c2c0999a8734651990fd4a93ba8169bf86efa3d514b4dfa5f25aaf0ba6d2a3"',
            },
          AssetParameters39c2c0999a8734651990fd4a93ba8169bf86efa3d514b4dfa5f25aaf0ba6d2a3ArtifactHashE1AD78A2:
            {
              Type: "String",
              Description:
                'Artifact hash for asset "39c2c0999a8734651990fd4a93ba8169bf86efa3d514b4dfa5f25aaf0ba6d2a3"',
            },
          AssetParameters5f4c7471f721131443c47de4c4bb141ec7e2e8be920127770bba2529a9dd2ba0S3Bucket8FA7C1C2:
            {
              Type: "String",
              Description:
                'S3 bucket for asset "5f4c7471f721131443c47de4c4bb141ec7e2e8be920127770bba2529a9dd2ba0"',
            },
          AssetParameters5f4c7471f721131443c47de4c4bb141ec7e2e8be920127770bba2529a9dd2ba0S3VersionKey989DEDF0:
            {
              Type: "String",
              Description:
                'S3 key for asset version "5f4c7471f721131443c47de4c4bb141ec7e2e8be920127770bba2529a9dd2ba0"',
            },
          AssetParameters5f4c7471f721131443c47de4c4bb141ec7e2e8be920127770bba2529a9dd2ba0ArtifactHash42507395:
            {
              Type: "String",
              Description:
                'Artifact hash for asset "5f4c7471f721131443c47de4c4bb141ec7e2e8be920127770bba2529a9dd2ba0"',
            },
          AssetParameters8342a54425e548c75603c60c957c6bc45924b3e156044255df6d971e49d59cb0S3BucketC324531E:
            {
              Type: "String",
              Description:
                'S3 bucket for asset "8342a54425e548c75603c60c957c6bc45924b3e156044255df6d971e49d59cb0"',
            },
          AssetParameters8342a54425e548c75603c60c957c6bc45924b3e156044255df6d971e49d59cb0S3VersionKey17F471E8:
            {
              Type: "String",
              Description:
                'S3 key for asset version "8342a54425e548c75603c60c957c6bc45924b3e156044255df6d971e49d59cb0"',
            },
          AssetParameters8342a54425e548c75603c60c957c6bc45924b3e156044255df6d971e49d59cb0ArtifactHash26C746FA:
            {
              Type: "String",
              Description:
                'Artifact hash for asset "8342a54425e548c75603c60c957c6bc45924b3e156044255df6d971e49d59cb0"',
            },
        },
        Outputs: {
          APIurl: {
            Value: {
              "Fn::Join": [
                "",
                [
                  "https://",
                  {
                    Ref: "TranslateAPI19A43816",
                  },
                  ".execute-api.",
                  {
                    Ref: "AWS::Region",
                  },
                  ".",
                  {
                    Ref: "AWS::URLSuffix",
                  },
                  "/",
                ],
              ],
            },
          },
          PutFunctionName: {
            Value: {
              Ref: "PutTranslationFunction9E955411",
            },
          },
          SaveFunctionName: {
            Value: {
              Ref: "SaveTranslationFunctionD9E440D6",
            },
          },
          GetFunctionName: {
            Value: {
              Ref: "GetTranslationFunction0677F2E3",
            },
          },
          TranslationBus: {
            Value: {
              Ref: "TranslateBus46D6DDAA",
            },
          },
          TranslationTable: {
            Value: {
              Ref: "TranslateTable1ABF9811",
            },
          },
        },
      },
      MatchStyle.EXACT
    )
  );
});
