/* eslint-disable @typescript-eslint/no-empty-function */
import { Construct } from "constructs";
import { Stack, StackProps, CfnOutput } from "aws-cdk-lib"; // core constructs
import { HttpApi, HttpMethod } from "@aws-cdk/aws-apigatewayv2-alpha"; // experimental
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha"; // experimental
import { aws_events as events } from "aws-cdk-lib";
import { aws_events_targets as events_targets } from "aws-cdk-lib";
import { aws_iam as iam } from "aws-cdk-lib";
import { aws_lambda as lambda } from "aws-cdk-lib";
import { aws_lambda_nodejs as lambda_nodejs } from "aws-cdk-lib";
import { CdkTranslatorDatabaseStack } from "./cdk-translator-database-stack";

interface CdkTranslatorStackProps extends StackProps {
  defaultBranch: string;
  branch: string;
}

export class CdkTranslatorStack extends Stack {
  constructor(scope: Construct, id: string, props?: CdkTranslatorStackProps) {
    super(scope, id, props);

    const { defaultBranch, branch } = props as CdkTranslatorStackProps;

    const databaseStack = new CdkTranslatorDatabaseStack(
      this,
      `CdkTranslatorDatabaseStack-${branch}`,
      {
        terminationProtection: defaultBranch === branch,
      }
    );

    const translateTable = databaseStack.translateTable;

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
        entry: "services/put-translation/src/app.ts",
        handler: "handler",
        tracing: lambda.Tracing.ACTIVE,
        bundling: {
          environment: {
            NODE_ENV: "production",
          },
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
        entry: "services/get-translation/src/app.ts",
        handler: "handler",
        tracing: lambda.Tracing.ACTIVE,
        bundling: {
          environment: {
            NODE_ENV: "production",
          },
        },
        environment: {
          TRANSLATE_TABLE: translateTable.tableName || "",
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
        entry: "services/save-translation/src/app.ts",
        handler: "handler",
        tracing: lambda.Tracing.ACTIVE,
        bundling: {
          environment: {
            NODE_ENV: "production",
          },
        },
        environment: {
          TRANSLATE_TABLE: translateTable.tableName || "",
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
  }
}
