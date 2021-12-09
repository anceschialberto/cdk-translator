import { Construct } from "constructs";
import { Stack, StackProps, Stage } from "aws-cdk-lib"; // core constructs

import { aws_codestarconnections as codestarconnections } from "aws-cdk-lib";
import {
  CodePipeline,
  CodePipelineSource,
  ManualApprovalStep,
  ShellStep,
} from "aws-cdk-lib/pipelines";

import { CdkTranslatorStage } from "./cdk-translator-stage";

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
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
      env: { account: "493156571491", region: "eu-west-1" },
    });

    pipeline.addStage(devStage, {
      post: [
        new ManualApprovalStep("DeployApproval", {
          comment: "Approve to deploy to the next stage",
        }),
      ],
    });

    const prodStage = new CdkTranslatorStage(this, "Prod", {
      env: { account: "729684387644", region: "eu-west-1" },
    });

    pipeline.addStage(prodStage);
  }
}
