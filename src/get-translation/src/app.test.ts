/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { mockClient } from "aws-sdk-client-mock";
import { DynamoDB, ScanCommand } from "@aws-sdk/client-dynamodb";
import { handler } from "./app";
import { APIGatewayEvent } from "aws-lambda";

const dynamoMock = mockClient(DynamoDB);

describe("get-translation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    dynamoMock.reset();
  });

  it("DynamoDB client is called", async () => {
    dynamoMock.on(ScanCommand).resolves({
      Items: [],
    });

    await handler({} as APIGatewayEvent);

    expect(dynamoMock.calls()).toHaveLength(1);
  });
});
