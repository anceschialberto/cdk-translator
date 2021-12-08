import { Construct } from "constructs";
import { Stack, StackProps } from "aws-cdk-lib"; // core constructs

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

    // Pipeline creation starts
    const pipeline = new CodePipeline(this, "Pipeline", {
      synth: new ShellStep("Synth", {
        input: CodePipelineSource.connection(
          "anceschialberto/cdk-translator",
          "main",
          { connectionArn: githubConnection.attrConnectionArn }
        ),
        commands: ["npm ci", "npx cdk synth"],
      }),
    });

    pipeline.addStage(
      new CdkTranslatorStage(this, "Dev", {
        env: { account: "493156571491", region: "eu-west-1" },
      }),
      {
        post: [new ManualApprovalStep("Approval")],
      }
    );

    pipeline.addStage(
      new CdkTranslatorStage(this, "Prod", {
        env: { account: "729684387644", region: "eu-west-1" },
      })
    );
  }
}
