import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { CdkTranslatorDatabaseStack } from "./cdk-translator-database-stack";
import { CdkTranslatorStack } from "./cdk-translator-stack";

/**
 * The application
 *
 * May consist of one or more Stacks (here, only one)
 */
export class CdkTranslatorStage extends cdk.Stage {
  constructor(scope: Construct, id: string, props?: cdk.StageProps) {
    super(scope, id, props);

    const database = new CdkTranslatorDatabaseStack(
      this,
      "CdkTranslatorDatabaseStack",
      {
        terminationProtection: true,
      }
    );

    new CdkTranslatorStack(this, "CdkTranslatorStack", {
      translateTable: database.translateTable,
    });
  }
}
