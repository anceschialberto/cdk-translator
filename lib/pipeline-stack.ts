import { Construct } from "constructs";
import { Environment, Stack, StackProps } from "aws-cdk-lib"; // core constructs

import { aws_codestarconnections as codestarconnections } from "aws-cdk-lib";
import {
  CodePipeline,
  CodePipelineSource,
  ManualApprovalStep,
  ShellStep,
} from "aws-cdk-lib/pipelines";

import { CdkTranslatorStage } from "./cdk-translator-stage";

interface PipelineStackProps extends StackProps {
  devEnvironment: Environment;
  prodEnvironment: Environment;
}

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: PipelineStackProps) {
    super(scope, id, props);

    const githubConnection = new codestarconnections.CfnConnection(
      this,
      "GitHubConnection",
      {
        connectionName: "github-connection",
        providerType: "GitHub",
      }
    );

    const source = CodePipelineSource.connection(
      "anceschialberto/cdk-translator",
      "main",
      { connectionArn: githubConnection.attrConnectionArn }
    );

    const synthStep = new ShellStep("Synth", {
      input: source,
      commands: ["npm i -g npm@8", "npm ci", "npx cdk synth"],
    });

    // Pipeline creation starts
    const pipeline = new CodePipeline(this, "Pipeline", {
      synth: synthStep,
      crossAccountKeys: true,
    });

    const devStage = new CdkTranslatorStage(this, "Dev", {
      env: props?.devEnvironment,
    });

    pipeline.addStage(devStage, {
      post: [
        new ManualApprovalStep("DeployApproval", {
          comment: "Approve to deploy to the next stage",
        }),
      ],
    });

    const prodStage = new CdkTranslatorStage(this, "Prod", {
      env: props?.prodEnvironment,
    });

    pipeline.addStage(prodStage);
  }
}
