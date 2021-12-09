/* eslint-disable @typescript-eslint/no-empty-function */
import { Construct } from "constructs";
import { CfnOutput, Stack, StackProps } from "aws-cdk-lib"; // core constructs
import { aws_dynamodb as dynamodb } from "aws-cdk-lib";

export class CdkTranslatorDatabaseStack extends Stack {
  readonly translateTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // ###################################################
    // Translation DDB table
    // ###################################################
    this.translateTable = new dynamodb.Table(this, "TranslateTable", {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "language", type: dynamodb.AttributeType.STRING },
    });

    // ###################################################
    // Outputs
    // ###################################################
    new CfnOutput(this, "Translation Table", {
      value: this.translateTable.tableName,
    });
  }
}
