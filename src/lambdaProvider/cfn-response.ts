/* Copyright 2015 Amazon Web Services, Inc. or its affiliates. All Rights Reserved.
   This file is licensed to you under the AWS Customer Agreement (the "License").
   You may not use this file except in compliance with the License.
   A copy of the License is located at http://aws.amazon.com/agreement/ .
   This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, express or implied.
   See the License for the specific language governing permissions and limitations under the License. */

/**
 * This is ts adapted source code from cfn-response module, which is no longer bundled
 * in lambda runtimes when using ZipFile resources. See: https://github.com/aws/aws-sdk-js/issues/2955
 */

import { request as _request } from "https";
import { parse } from "url";
import { Context, CloudFormationCustomResourceEvent } from "aws-lambda";

export const SUCCESS = "SUCCESS";
export const FAILED = "FAILED";

export const send = (
  event: CloudFormationCustomResourceEvent,
  context: Context,
  responseStatus: "SUCCESS" | "FAILED",
  responseData?: object,
  physicalResourceId?: string,
  noEcho?: boolean
): void => {
  const responseBody = JSON.stringify({
    Status: responseStatus,
    Reason:
      "See the details in CloudWatch Log Stream: " + context.logStreamName,
    PhysicalResourceId: physicalResourceId || context.logStreamName,
    StackId: event.StackId,
    RequestId: event.RequestId,
    LogicalResourceId: event.LogicalResourceId,
    NoEcho: noEcho || false,
    Data: responseData,
  });

  console.log("Response body:\n", responseBody);

  const parsedUrl = parse(event.ResponseURL);
  const options = {
    hostname: parsedUrl.hostname,
    port: 443,
    path: parsedUrl.path,
    method: "PUT",
    headers: {
      "content-type": "",
      "content-length": responseBody.length,
    },
  };

  const request = _request(options, function (response) {
    console.log("Status code: " + response.statusCode);
    console.log("Status message: " + response.statusMessage);
    context.done();
  });

  request.on("error", function (error) {
    console.log("send(..) failed executing https.request(..): " + error);
    context.done();
  });

  request.write(responseBody);
  request.end();
};
