# CDK Stack Output Provider
AWS CloudFormation has an architectural limitation that prevents a stack from accessing any other stack's outputs unless its in the same account and same region. This [CDK Construct](https://docs.aws.amazon.com/cdk/latest/guide/constructs.html) uses a Lambda singleton to fetch a stack's output in another region.

*Note:* This package is in alpha and still under development. Until it is complete, feel free to use this package as a starting point for your own projects.

## Usage
```ts
import { StackOutputProvider } from "cdk-stack-output-provider";

const stackOutputResource = new StackOutputProvider(
    this,
    "StackOutputResource",
    {
        region: 'us-east-1',
        stackName: "<STACK_NAME>",
        outputKey: "<STACK_OUTPUT_KEY>"
    }
);

const myOutputValue: string = stackOutputResource.output;
```