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
  branch: process.env.BRANCH as string,
  devAccountId: process.env.DEV_ACCOUNT_ID as string,
};

if (props.branch === props.defaultBranch) {
  props.prodAccountId = process.env.PROD_ACCOUNT_ID as string;
}

new PipelineStack(app, `CdkTranslator-cicd-${props.branch}`, {
  env: { account: process.env.SHARED_ACCOUNT_ID, region: props.region }, // shared
  ...props,
});

app.synth();
