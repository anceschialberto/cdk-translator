/* eslint-disable @typescript-eslint/no-empty-function */
import { Construct } from "constructs";
import { Stack, StackProps, CfnOutput } from "aws-cdk-lib"; // core constructs
import { HttpApi, HttpMethod } from "@aws-cdk/aws-apigatewayv2-alpha"; // experimental
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha"; // experimental
import { aws_dynamodb as dynamodb } from "aws-cdk-lib";
import { aws_events as events } from "aws-cdk-lib";
import { aws_events_targets as events_targets } from "aws-cdk-lib";
import { aws_iam as iam } from "aws-cdk-lib";
import { aws_lambda as lambda } from "aws-cdk-lib";
import { aws_lambda_nodejs as lambda_nodejs } from "aws-cdk-lib";

const DUMMY_PACKAGE_JSON =
  '{\n\t\\"name\\": \\"dummy\\",\n\t\\"version\\": \\"0.0.1\\"\n}';

const commandHooks = {
  beforeBundling: () => [],
  afterBundling(inputDir: string, outputDir: string): string[] {
    return [`printf "${DUMMY_PACKAGE_JSON}" > ${outputDir}/package.json`];
  },
  beforeInstall: () => [],
};

export class CdkTranslatorStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // ###################################################
    // Translation DDB table
    // ###################################################
    const translateTable = new dynamodb.Table(this, "TranslateTable", {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "language", type: dynamodb.AttributeType.STRING },
    });

    // ###################################################
    // Translation EventBridge bus
    // ###################################################
    const translateBus = new events.EventBus(this, "TranslateBus", {
      eventBusName: "TranslateBus",
    });

    // ###################################################
    // Put translation function
    // ###################################################
    const putTranslationFunction = new lambda_nodejs.NodejsFunction(
      this,
      "PutTranslationFunction",
      {
        runtime: lambda.Runtime.NODEJS_14_X,
        entry: "app/put-translation/src/app.ts",
        handler: "handler",
        tracing: lambda.Tracing.ACTIVE,
        bundling: {
          environment: {
            NODE_ENV: "production",
          },
          commandHooks,
        },
        environment: {
          TRANSLATE_BUS: translateBus.eventBusName,
        },
      }
    );

    translateBus.grantPutEventsTo(putTranslationFunction);

    const translatePolicyStatement = new iam.PolicyStatement({
      actions: ["translate:TranslateText"],
      resources: ["*"],
    });

    putTranslationFunction.role?.attachInlinePolicy(
      new iam.Policy(this, "PutTranslatePolicy", {
        statements: [translatePolicyStatement],
      })
    );

    // ###################################################
    // Get translations function
    // ###################################################
    const getTranslationFunction = new lambda_nodejs.NodejsFunction(
      this,
      "GetTranslationFunction",
      {
        runtime: lambda.Runtime.NODEJS_14_X,
        entry: "app/get-translation/src/app.ts",
        handler: "handler",
        tracing: lambda.Tracing.ACTIVE,
        bundling: {
          environment: {
            NODE_ENV: "production",
          },
          commandHooks,
        },
        environment: {
          TRANSLATE_TABLE: translateTable.tableName,
        },
      }
    );

    translateTable.grantReadData(getTranslationFunction);

    // ###################################################
    // Save translations function
    // ###################################################
    const saveTranslationFunction = new lambda_nodejs.NodejsFunction(
      this,
      "SaveTranslationFunction",
      {
        runtime: lambda.Runtime.NODEJS_14_X,
        entry: "app/save-translation/src/app.ts",
        handler: "handler",
        tracing: lambda.Tracing.ACTIVE,
        bundling: {
          environment: {
            NODE_ENV: "production",
          },
          commandHooks,
        },
        environment: {
          TRANSLATE_TABLE: translateTable.tableName,
        },
      }
    );

    translateTable.grantWriteData(saveTranslationFunction);

    // ###################################################
    // EventBridge Rule
    // ###################################################
    new events.Rule(this, "SaveTranslationRule", {
      eventBus: translateBus,
      eventPattern: { detailType: ["translation"] },
      targets: [new events_targets.LambdaFunction(saveTranslationFunction)],
    });

    // ###################################################
    // API Gateway and routes
    // ###################################################
    const translateAPI = new HttpApi(this, "TranslateAPI");

    translateAPI.addRoutes({
      path: "/",
      methods: [HttpMethod.POST],
      integration: new HttpLambdaIntegration(
        "PutTranslationIntegration",
        putTranslationFunction
      ),
    });

    const getProxy = new HttpLambdaIntegration(
      "GetTranslationIntegration",
      getTranslationFunction
    );

    translateAPI.addRoutes({
      path: "/{id}",
      methods: [HttpMethod.GET],
      integration: getProxy,
    });

    translateAPI.addRoutes({
      path: "/",
      methods: [HttpMethod.GET],
      integration: getProxy,
    });

    // ###################################################
    // Outputs
    // ###################################################
    new CfnOutput(this, "API url", {
      value: translateAPI.url!,
    });
    new CfnOutput(this, "Put Function Name", {
      value: putTranslationFunction.functionName,
    });
    new CfnOutput(this, "Save Function Name", {
      value: saveTranslationFunction.functionName,
    });
    new CfnOutput(this, "Get Function Name", {
      value: getTranslationFunction.functionName,
    });
    new CfnOutput(this, "Translation Bus", {
      value: translateBus.eventBusName,
    });
    new CfnOutput(this, "Translation Table", {
      value: translateTable.tableName,
    });
  }
}
