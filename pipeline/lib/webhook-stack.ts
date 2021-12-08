import path from "path";

import { Construct } from "constructs";
import { Stack, StackProps, CfnOutput } from "aws-cdk-lib"; // core constructs

import { aws_lambda as lambda } from "aws-cdk-lib";
import { aws_lambda_nodejs as lambda_nodejs } from "aws-cdk-lib";
import { aws_iam as iam } from "aws-cdk-lib";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha"; // experimental
import { HttpApi, HttpMethod } from "@aws-cdk/aws-apigatewayv2-alpha"; // experimental

const DUMMY_PACKAGE_JSON =
  '{\n\t\\"name\\": \\"dummy\\",\n\t\\"version\\": \\"0.0.1\\"\n}';

const commandHooks = {
  beforeBundling: () => [],
  afterBundling(inputDir: string, outputDir: string): string[] {
    return [`printf "${DUMMY_PACKAGE_JSON}" > ${outputDir}/package.json`];
  },
  beforeInstall: () => [],
};

interface WebhookProps extends StackProps {
  pipelineArn: string;
  pipelineName: string;
}

export class WebhookStack extends Stack {
  constructor(scope: Construct, id: string, props?: WebhookProps) {
    super(scope, id, props);

    const webhookFunction = new lambda_nodejs.NodejsFunction(
      this,
      "WebhookFunction",
      {
        runtime: lambda.Runtime.NODEJS_14_X,
        entry: path.join(__dirname, "..", "webhook/src/app.ts"),
        handler: "handler",
        bundling: {
          environment: {
            NODE_ENV: "production",
          },
          commandHooks,
        },
        environment: {
          PIPELINE_NAME: props!.pipelineName,
        },
      }
    );

    const startPipelineExecutionStatement = new iam.PolicyStatement({
      actions: ["codepipeline:StartPipelineExecution"],
      resources: [props!.pipelineArn],
    });

    webhookFunction.role?.attachInlinePolicy(
      new iam.Policy(this, "StartPipelineExecutionPolicy", {
        statements: [startPipelineExecutionStatement],
      })
    );

    // ###################################################
    // API Gateway and routes
    // ###################################################
    const webhookAPI = new HttpApi(this, "WebhookAPI");

    webhookAPI.addRoutes({
      path: "/trigger",
      methods: [HttpMethod.POST],
      integration: new HttpLambdaIntegration(
        "WebhookIntegration",
        webhookFunction
      ),
    });

    // ###################################################
    // Outputs
    // ###################################################
    new CfnOutput(this, "Webhook url", {
      value: webhookAPI.url!,
    });
  }
}
