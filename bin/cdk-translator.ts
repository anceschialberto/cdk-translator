#!/usr/bin/env node
import "source-map-support/register";
import { App } from "aws-cdk-lib"; // core constructs
import { PipelineStack } from "../lib/pipeline-stack";

const app = new App();

new PipelineStack(app, "CdkTranslator-cicd", {
  env: { account: "072131556362", region: "eu-west-1" }, // shared
  devEnvironment: { account: "493156571491", region: "eu-west-1" },
  prodEnvironment: { account: "729684387644", region: "eu-west-1" },
});
