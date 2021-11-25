/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { Template } from "@aws-cdk/assertions";
import * as cdk from "@aws-cdk/core";
import * as CdkDay from "../lib/cdk-day-stack";

test("Empty Stack", () => {
  const app = new cdk.App();
  const stack = new CdkDay.CdkDayStack(app, "CdkDayStack");

  // Prepare the stack for assertions.
  const template = Template.fromStack(stack);

  // Assert the template matches the snapshot.
  expect(template.toJSON()).toMatchSnapshot();
});
