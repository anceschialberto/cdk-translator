/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: MIT-0
 */

import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

const dynamoClient = new DynamoDB({});
const TableName = process.env.TRANSLATE_TABLE;

exports.getOne = async function (id: any) {
  const dynamoParams = {
    TableName,
    ExpressionAttributeValues: marshall({
      ":i": id,
    }),
    KeyConditionExpression: "id = :i",
  };
  return dynamoClient.query(dynamoParams);
};

exports.getAll = async function () {
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

export const handler = async function (event: any) {
  let response;
  try {
    if (event.pathParameters && event.pathParameters.id)
      response = await exports.getOne(event.pathParameters.id);
    else response = await exports.getAll();

    return {
      Items: response.Items.map((item: any) => {
        const data = unmarshall(item);
        delete data.language;
        return data;
      }),
    };
  } catch (error) {
    throw new Error((error as any).message);
  }
};
