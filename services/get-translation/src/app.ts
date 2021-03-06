/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: MIT-0
 */

import { DynamoDB, QueryCommandOutput } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { APIGatewayEvent } from "aws-lambda";

const dynamoClient = new DynamoDB({});
const TableName = process.env.TRANSLATE_TABLE;

const getOne = async (id: string) => {
  const dynamoParams = {
    TableName,
    ExpressionAttributeValues: marshall({
      ":i": id,
    }),
    KeyConditionExpression: "id = :i",
  };
  return dynamoClient.query(dynamoParams);
};

const getAll = async () => {
  const dynamoParams = {
    TableName,
    ExpressionAttributeNames: {
      "#l": "language",
    },
    ExpressionAttributeValues: marshall({
      ":l": "en",
    }),
    FilterExpression: "#l = :l",
  };
  return dynamoClient.scan(dynamoParams);
};

export const handler = async function (event: APIGatewayEvent) {
  let response: QueryCommandOutput;
  try {
    if (event.pathParameters && event.pathParameters.id)
      response = await getOne(event.pathParameters.id);
    else response = await getAll();

    return {
      Items: response.Items?.map((item) => {
        const data = unmarshall(item);
        delete data.language;
        return data;
      }),
    };
  } catch (error) {
    if (error instanceof Error) throw new Error(error.message);
    else throw error;
  }
};
