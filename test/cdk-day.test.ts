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
                  Ref: "AssetParametersb1c06fdba1d6052232c37a1166c3a7e343e641abf20a12ae174b9cdf7006e3d4S3BucketB61944E9",
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
                                Ref: "AssetParametersb1c06fdba1d6052232c37a1166c3a7e343e641abf20a12ae174b9cdf7006e3d4S3VersionKey8AFA0E7C",
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
                                Ref: "AssetParametersb1c06fdba1d6052232c37a1166c3a7e343e641abf20a12ae174b9cdf7006e3d4S3VersionKey8AFA0E7C",
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
                  Ref: "AssetParameters9e5001c2e349c386899bfa16069df2530e25a5e585b378f45df13e1ce7e7fb46S3Bucket8EDC9A78",
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
                                Ref: "AssetParameters9e5001c2e349c386899bfa16069df2530e25a5e585b378f45df13e1ce7e7fb46S3VersionKey596C4D0B",
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
                                Ref: "AssetParameters9e5001c2e349c386899bfa16069df2530e25a5e585b378f45df13e1ce7e7fb46S3VersionKey596C4D0B",
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
                  Ref: "AssetParametersc69baa6be02b71fcf4bd530a47a1bf44a1bcd7b03a24d8f750a64f8a18606fe3S3Bucket4215D24D",
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
                                Ref: "AssetParametersc69baa6be02b71fcf4bd530a47a1bf44a1bcd7b03a24d8f750a64f8a18606fe3S3VersionKeyB29BE2E2",
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
                                Ref: "AssetParametersc69baa6be02b71fcf4bd530a47a1bf44a1bcd7b03a24d8f750a64f8a18606fe3S3VersionKeyB29BE2E2",
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
          AssetParametersb1c06fdba1d6052232c37a1166c3a7e343e641abf20a12ae174b9cdf7006e3d4S3BucketB61944E9:
            {
              Type: "String",
              Description:
                'S3 bucket for asset "b1c06fdba1d6052232c37a1166c3a7e343e641abf20a12ae174b9cdf7006e3d4"',
            },
          AssetParametersb1c06fdba1d6052232c37a1166c3a7e343e641abf20a12ae174b9cdf7006e3d4S3VersionKey8AFA0E7C:
            {
              Type: "String",
              Description:
                'S3 key for asset version "b1c06fdba1d6052232c37a1166c3a7e343e641abf20a12ae174b9cdf7006e3d4"',
            },
          AssetParametersb1c06fdba1d6052232c37a1166c3a7e343e641abf20a12ae174b9cdf7006e3d4ArtifactHash8EC76696:
            {
              Type: "String",
              Description:
                'Artifact hash for asset "b1c06fdba1d6052232c37a1166c3a7e343e641abf20a12ae174b9cdf7006e3d4"',
            },
          AssetParameters9e5001c2e349c386899bfa16069df2530e25a5e585b378f45df13e1ce7e7fb46S3Bucket8EDC9A78:
            {
              Type: "String",
              Description:
                'S3 bucket for asset "9e5001c2e349c386899bfa16069df2530e25a5e585b378f45df13e1ce7e7fb46"',
            },
          AssetParameters9e5001c2e349c386899bfa16069df2530e25a5e585b378f45df13e1ce7e7fb46S3VersionKey596C4D0B:
            {
              Type: "String",
              Description:
                'S3 key for asset version "9e5001c2e349c386899bfa16069df2530e25a5e585b378f45df13e1ce7e7fb46"',
            },
          AssetParameters9e5001c2e349c386899bfa16069df2530e25a5e585b378f45df13e1ce7e7fb46ArtifactHashF847F138:
            {
              Type: "String",
              Description:
                'Artifact hash for asset "9e5001c2e349c386899bfa16069df2530e25a5e585b378f45df13e1ce7e7fb46"',
            },
          AssetParametersc69baa6be02b71fcf4bd530a47a1bf44a1bcd7b03a24d8f750a64f8a18606fe3S3Bucket4215D24D:
            {
              Type: "String",
              Description:
                'S3 bucket for asset "c69baa6be02b71fcf4bd530a47a1bf44a1bcd7b03a24d8f750a64f8a18606fe3"',
            },
          AssetParametersc69baa6be02b71fcf4bd530a47a1bf44a1bcd7b03a24d8f750a64f8a18606fe3S3VersionKeyB29BE2E2:
            {
              Type: "String",
              Description:
                'S3 key for asset version "c69baa6be02b71fcf4bd530a47a1bf44a1bcd7b03a24d8f750a64f8a18606fe3"',
            },
          AssetParametersc69baa6be02b71fcf4bd530a47a1bf44a1bcd7b03a24d8f750a64f8a18606fe3ArtifactHashB1377D2A:
            {
              Type: "String",
              Description:
                'Artifact hash for asset "c69baa6be02b71fcf4bd530a47a1bf44a1bcd7b03a24d8f750a64f8a18606fe3"',
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
