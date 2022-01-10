#!/usr/bin/env node
import "source-map-support/register";
import { App } from "aws-cdk-lib"; // core constructs
import { PipelineStack, PipelineStackProps } from "../cicd/pipeline-stack";

const app = new App();

const props: PipelineStackProps = {
  codebuildPrefix: "CodeBuild",
  region: "eu-west-1",
  repoName: "anceschialberto/cdk-translator",
  defaultBranch: "main",
  // branch: process.env.BRANCH as string,
  branch: "main",
  // devAccountId: process.env.DEV_ACCOUNT_ID as string,
  devAccountId: "493156571491",
};

if (props.branch === props.defaultBranch) {
  // props.prodAccountId = process.env.PROD_ACCOUNT_ID as string;
  props.prodAccountId = "729684387644";
}

new PipelineStack(app, `CdkTranslator-cicd-${props.branch}`, {
  // env: { account: process.env.SHARED_ACCOUNT_ID, region: props.region }, // shared
  env: { account: "072131556362", region: props.region }, // shared
  ...props,
});

app.synth();
