#!/usr/bin/env node
import "source-map-support/register";
import { App } from "aws-cdk-lib"; // core constructs
import { CdkTranslatorStage } from "../lib/cdk-translator-stage";

const app = new App();
new CdkTranslatorStage(app, "CdkTranslator", {});
