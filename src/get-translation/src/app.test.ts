import { mockClient } from "aws-sdk-client-mock";
import { DynamoDB, ScanCommand } from "@aws-sdk/client-dynamodb";
import { handler } from "./app";

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

    await handler({});

    expect(dynamoMock.calls()).toHaveLength(1);
  });
});
