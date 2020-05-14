/**
 * This Lambda handler enables fetching of outputs to enable sharing of parameters cross-region.
 * It is only executed at cfn build-time
 */
import { Handler, CloudFormationCustomResourceEvent } from "aws-lambda";
import { CloudFormation } from "aws-sdk";
import * as response from "./cfn-response";

export const handler: Handler = (
  event: CloudFormationCustomResourceEvent,
  context
) => {
  console.log("REQUEST RECEIVED:\n" + JSON.stringify(event));

  const {
    RequestType,
    ResourceProperties: { stackName: StackName, outputKey: OutputKey, region },
  } = event;

  if (RequestType === "Delete") {
    return response.send(event, context, response.SUCCESS);
  }

  const cfn = new CloudFormation({ region });

  cfn.describeStacks({ StackName }, (err, { Stacks }) => {
    if (err) {
      console.log("Error during stack describe:\n", err);
      return response.send(event, context, response.FAILED, err);
    }

    const output = Stacks?.[0].Outputs?.filter(
      (out) => out.OutputKey === OutputKey
    )
      .map((out) => out.OutputValue)
      .join();

    return response.send(event, context, response.SUCCESS, { output });
  });

  return;
};
