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
                  Ref: "AssetParameters58039120386d134bdb9b131a1d66aad667b5d247559deeb2475ade436ebdb5bfS3Bucket4F11EC85",
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
                                Ref: "AssetParameters58039120386d134bdb9b131a1d66aad667b5d247559deeb2475ade436ebdb5bfS3VersionKeyEB8EB18B",
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
                                Ref: "AssetParameters58039120386d134bdb9b131a1d66aad667b5d247559deeb2475ade436ebdb5bfS3VersionKeyEB8EB18B",
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
                  Ref: "AssetParametersac876b377e3eb04bbfd22576513499b0ac57016504471449176db8c4d4c2de3aS3Bucket287A4851",
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
                                Ref: "AssetParametersac876b377e3eb04bbfd22576513499b0ac57016504471449176db8c4d4c2de3aS3VersionKeyF7DA59D1",
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
                                Ref: "AssetParametersac876b377e3eb04bbfd22576513499b0ac57016504471449176db8c4d4c2de3aS3VersionKeyF7DA59D1",
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
                  Ref: "AssetParameters053704cf714798dbb50e2bf6badc8745512c2e6a381441c8da17a99e365175dbS3Bucket96576A56",
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
                                Ref: "AssetParameters053704cf714798dbb50e2bf6badc8745512c2e6a381441c8da17a99e365175dbS3VersionKey885AD6EB",
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
                                Ref: "AssetParameters053704cf714798dbb50e2bf6badc8745512c2e6a381441c8da17a99e365175dbS3VersionKey885AD6EB",
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
          AssetParameters58039120386d134bdb9b131a1d66aad667b5d247559deeb2475ade436ebdb5bfS3Bucket4F11EC85:
            {
              Type: "String",
              Description:
                'S3 bucket for asset "58039120386d134bdb9b131a1d66aad667b5d247559deeb2475ade436ebdb5bf"',
            },
          AssetParameters58039120386d134bdb9b131a1d66aad667b5d247559deeb2475ade436ebdb5bfS3VersionKeyEB8EB18B:
            {
              Type: "String",
              Description:
                'S3 key for asset version "58039120386d134bdb9b131a1d66aad667b5d247559deeb2475ade436ebdb5bf"',
            },
          AssetParameters58039120386d134bdb9b131a1d66aad667b5d247559deeb2475ade436ebdb5bfArtifactHashE2F4828C:
            {
              Type: "String",
              Description:
                'Artifact hash for asset "58039120386d134bdb9b131a1d66aad667b5d247559deeb2475ade436ebdb5bf"',
            },
          AssetParametersac876b377e3eb04bbfd22576513499b0ac57016504471449176db8c4d4c2de3aS3Bucket287A4851:
            {
              Type: "String",
              Description:
                'S3 bucket for asset "ac876b377e3eb04bbfd22576513499b0ac57016504471449176db8c4d4c2de3a"',
            },
          AssetParametersac876b377e3eb04bbfd22576513499b0ac57016504471449176db8c4d4c2de3aS3VersionKeyF7DA59D1:
            {
              Type: "String",
              Description:
                'S3 key for asset version "ac876b377e3eb04bbfd22576513499b0ac57016504471449176db8c4d4c2de3a"',
            },
          AssetParametersac876b377e3eb04bbfd22576513499b0ac57016504471449176db8c4d4c2de3aArtifactHashCCAE60BE:
            {
              Type: "String",
              Description:
                'Artifact hash for asset "ac876b377e3eb04bbfd22576513499b0ac57016504471449176db8c4d4c2de3a"',
            },
          AssetParameters053704cf714798dbb50e2bf6badc8745512c2e6a381441c8da17a99e365175dbS3Bucket96576A56:
            {
              Type: "String",
              Description:
                'S3 bucket for asset "053704cf714798dbb50e2bf6badc8745512c2e6a381441c8da17a99e365175db"',
            },
          AssetParameters053704cf714798dbb50e2bf6badc8745512c2e6a381441c8da17a99e365175dbS3VersionKey885AD6EB:
            {
              Type: "String",
              Description:
                'S3 key for asset version "053704cf714798dbb50e2bf6badc8745512c2e6a381441c8da17a99e365175db"',
            },
          AssetParameters053704cf714798dbb50e2bf6badc8745512c2e6a381441c8da17a99e365175dbArtifactHashB9B819FB:
            {
              Type: "String",
              Description:
                'Artifact hash for asset "053704cf714798dbb50e2bf6badc8745512c2e6a381441c8da17a99e365175db"',
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
