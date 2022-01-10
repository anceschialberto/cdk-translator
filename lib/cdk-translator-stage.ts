import { Stage, StageProps } from "aws-cdk-lib";
import { Construct } from "constructs";

import { CdkTranslatorStack } from "./cdk-translator-stack";

interface CdkTranslatorStageProps extends StageProps {
  defaultBranch: string;
  branch: string;
}

/**
 * The application
 *
 * May consist of one or more Stacks (here, only one)
 */
export class CdkTranslatorStage extends Stage {
  mainStackName: string;

  constructor(scope: Construct, id: string, props?: CdkTranslatorStageProps) {
    super(scope, id, props);

    const { defaultBranch, branch } = props as CdkTranslatorStageProps;

    const mainStackName = "CdkTranslatorStack";

    new CdkTranslatorStack(this, `${mainStackName}-${branch}`, {
      defaultBranch,
      branch,
    });

    this.mainStackName = mainStackName;
  }
}
