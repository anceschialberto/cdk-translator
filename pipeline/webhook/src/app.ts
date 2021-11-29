import { APIGatewayEvent } from "aws-lambda";
import {
  CodePipelineClient,
  StartPipelineExecutionCommand,
} from "@aws-sdk/client-codepipeline";

const codePipelineClient = new CodePipelineClient({});

// https://docs.github.com/en/developers/webhooks-and-events/webhooks/securing-your-webhooks
export const handler = async (event: APIGatewayEvent) => {
  console.info("Webhook handler invoked");
  const body = JSON.parse(event.body ?? "") as unknown;
  console.info(JSON.stringify(body, null, 2));

  await codePipelineClient.send(
    new StartPipelineExecutionCommand({ name: process.env.PIPELINE_NAME })
  );

  return { statusCode: 202, body: "" };
};
