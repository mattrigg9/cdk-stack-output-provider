import {
  Construct,
  CustomResource,
  CustomResourceProvider,
  CustomResourceProviderRuntime,
  Token,
} from "@aws-cdk/core";
import { PolicyStatement, Effect } from "@aws-cdk/aws-iam";
import * as path from "path";

export interface StackOutputProviderProps {
  readonly region: string;
  readonly accountId: string | number; // TODO: Move to abstraction through context
  readonly stackName: string;
  readonly outputKey: string;
}

/**
 * Custom construct that supports fetching of x-region cfn stack outputs
 */
export class StackOutputProvider extends Construct {
  public readonly output: string;

  constructor(scope: Construct, id: string, props: StackOutputProviderProps) {
    super(scope, id);

    // Creates a singleton lambda in the background to fetch x-region stack outputs
    const resourceType = "Custom::StackOutput";
    const serviceToken = CustomResourceProvider.getOrCreate(
      this,
      resourceType,
      {
        codeDirectory: path.join(__dirname, "lambdaProvider"),
        runtime: CustomResourceProviderRuntime.NODEJS_12,
        policyStatements: [
          new PolicyStatement({
            effect: Effect.ALLOW,
            actions: ["cloudformation:DescribeStacks"],
            resources: [
              `arn:aws:cloudformation:${props.region}:${props.accountId}:stack/${props.stackName}/*`,
            ],
          }).toStatementJson(),
        ],
      }
    );

    const resource = new CustomResource(this, "OutputResource", {
      resourceType,
      serviceToken,
      properties: {
        region: props.region,
        stackName: props.stackName,
        outputKey: props.outputKey,
      },
    });

    this.output = Token.asString(resource.getAtt("output"));
  }
}
