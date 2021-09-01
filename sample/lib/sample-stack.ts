import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import * as apigw from "@aws-cdk/aws-apigateway";
import { HitCounter } from "./hitcounter";
import { TableViewer } from "cdk-dynamo-table-viewer";

export class SampleStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const hello = new NodejsFunction(this, "HelloHandler", {
      runtime: lambda.Runtime.NODEJS_14_X,
      entry: "lambda/index.ts",
    });

    const helloWithCounter = new HitCounter(this, "HelloHitCounter", {
      downstream: hello,
    });

    new apigw.LambdaRestApi(this, "Endpoint", {
      handler: helloWithCounter.handler,
    });

    new TableViewer(this, "ViewHitCounter", {
      title: "Hello Hits",
      table: helloWithCounter.table,
      sortBy: "-hits",
    });
  }
}
