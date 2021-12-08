/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { assertions } from "aws-cdk-lib";
import { App } from "aws-cdk-lib"; // core constructs
import * as Pipeline from "../lib/pipeline-stack";

test("Empty Stack", () => {
  const app = new App();
  const stack = new Pipeline.PipelineStack(app, "CdkDayStack-cicd");

  // Prepare the stack for assertions.
  const template = assertions.Template.fromStack(stack);

  // Assert the template matches the snapshot.
  expect(template.toJSON()).toMatchSnapshot();
});
