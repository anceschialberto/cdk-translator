/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { APIGatewayEvent } from "aws-lambda";
import {
  CodePipelineClient,
  StartPipelineExecutionCommand,
} from "@aws-sdk/client-codepipeline";

const codePipelineClient = new CodePipelineClient({});

// https://docs.github.com/en/developers/webhooks-and-events/webhooks/securing-your-webhooks
export const handler = async (event: APIGatewayEvent) => {
  console.info("Webhook handler invoked");
  const body = JSON.parse(event.body ?? "{}") as Record<string, any>;
  console.info(JSON.stringify(body, null, 2));

  if (body.sender?.login === "aws-connector-for-github[bot]") {
    return {
      statusCode: 202,
      body: "AWS Connector bot detected, pipeline won't be triggered",
    };
  }

  await codePipelineClient.send(
    new StartPipelineExecutionCommand({ name: process.env.PIPELINE_NAME })
  );

  return { statusCode: 202, body: "Pipeline triggered" };
};
