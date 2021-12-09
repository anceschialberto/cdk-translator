#!/usr/bin/env node
import "source-map-support/register";
import { App } from "aws-cdk-lib"; // core constructs
import { PipelineStack } from "../lib/pipeline-stack";

const app = new App();

new PipelineStack(app, "CdkTranslator-cicd", {
  env: { account: "072131556362", region: "eu-west-1" }, // shared
});
