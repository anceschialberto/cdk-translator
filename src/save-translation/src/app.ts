/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: MIT-0
 */

import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { EventBridgeEvent } from "aws-lambda";

const dynamoClient = new DynamoDB({});
const TableName = process.env.TRANSLATE_TABLE;

export const handler = async (
  event: EventBridgeEvent<
    "translation",
    { language: string; translation: string; id: string }
  >
) => {
  const Item = marshall(event.detail);

  console.log(JSON.stringify(event));

  try {
    return dynamoClient.putItem({ TableName, Item });
  } catch (error) {
    if (error instanceof Error) throw new Error(error.message);
    else throw error;
  }
};
