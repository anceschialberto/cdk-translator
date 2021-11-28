import { APIGatewayEvent, Callback, Context } from "aws-lambda";

// https://docs.github.com/en/developers/webhooks-and-events/webhooks/securing-your-webhooks
export const handler = (event: APIGatewayEvent, ctx: Context, cb: Callback) => {
  console.info("Webhook handler invoked");
  console.info(JSON.stringify(event, null, 2));

  cb(null, { statusCode: 200, body: "" });
};
