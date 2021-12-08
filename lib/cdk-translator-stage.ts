import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { CdkTranslatorStack } from "./cdk-translator-stack";

/**
 * The application
 *
 * May consist of one or more Stacks (here, only one)
 */
export class CdkTranslatorStage extends cdk.Stage {
  constructor(scope: Construct, id: string, props?: cdk.StageProps) {
    super(scope, id, props);

    new CdkTranslatorStack(this, "CdkTranslatorStack");
  }
}
