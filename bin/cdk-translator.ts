#!/usr/bin/env node
import "source-map-support/register";
import { App } from "aws-cdk-lib"; // core constructs
import { CdkTranslatorStage } from "../lib/cdk-translator-stage";
import { PipelineStack } from "../lib/pipeline-stack";

const app = new App();
new CdkTranslatorStage(app, "CdkTranslator", {});
new PipelineStack(app, "CdkTranslator-cicd", {
  env: { account: "072131556362", region: "eu-west-1" }, // shared
});
