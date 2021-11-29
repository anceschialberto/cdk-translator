import path from "path";

import * as cdk from "@aws-cdk/core";
import { HttpApi, HttpMethod } from "@aws-cdk/aws-apigatewayv2";
import { LambdaProxyIntegration } from "@aws-cdk/aws-apigatewayv2-integrations";
import { Runtime } from "@aws-cdk/aws-lambda";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import { CfnOutput } from "@aws-cdk/core";
import { Policy, PolicyStatement } from "@aws-cdk/aws-iam";

const DUMMY_PACKAGE_JSON =
  '{\n\t\\"name\\": \\"dummy\\",\n\t\\"version\\": \\"0.0.1\\"\n}';

const commandHooks = {
  beforeBundling: () => [],
  afterBundling(inputDir: string, outputDir: string): string[] {
    return [`printf "${DUMMY_PACKAGE_JSON}" > ${outputDir}/package.json`];
  },
  beforeInstall: () => [],
};

interface WebhookProps extends cdk.StackProps {
  pipelineArn: string;
  pipelineName: string;
}

export class WebhookStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: WebhookProps) {
    super(scope, id, props);

    const webhookFunction = new NodejsFunction(this, "WebhookFunction", {
      runtime: Runtime.NODEJS_14_X,
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
    });

    const startPipelineExecutionStatement = new PolicyStatement({
      actions: ["codepipeline:StartPipelineExecution"],
      resources: [props!.pipelineArn],
    });

    webhookFunction.role?.attachInlinePolicy(
      new Policy(this, "StartPipelineExecutionPolicy", {
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
      integration: new LambdaProxyIntegration({
        handler: webhookFunction,
      }),
    });

    // ###################################################
    // Outputs
    // ###################################################
    new CfnOutput(this, "Webhook url", {
      value: webhookAPI.url!,
    });
  }
}
