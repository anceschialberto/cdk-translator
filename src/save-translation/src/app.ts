/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: MIT-0
 */

import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";

const dynamoClient = new DynamoDB({});
const TableName = process.env.TRANSLATE_TABLE;

exports.handler = async function (event: any) {
  const Item = marshall(event.detail);

  console.log(JSON.stringify(event));

  try {
    return dynamoClient.putItem({ TableName, Item });
  } catch (error) {
    throw new Error((error as any).message);
  }
};
