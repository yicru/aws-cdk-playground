import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import * as dynamodb from "@aws-cdk/aws-dynamodb";

export type HitCounterProps = {
  downstream: lambda.IFunction;
};

export class HitCounter extends cdk.Construct {
  public readonly handler: lambda.Function;
  public readonly table: dynamodb.Table;

  constructor(scope: cdk.Construct, id: string, props: HitCounterProps) {
    super(scope, id);

    const table = new dynamodb.Table(this, "Hits", {
      partitionKey: { name: "path", type: dynamodb.AttributeType.STRING },
    });
    this.table = table;

    this.handler = new NodejsFunction(this, "HitCounterHandler", {
      runtime: lambda.Runtime.NODEJS_14_X,
      entry: "lambda/hitcounter.ts",
      environment: {
        DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
        HITS_TABLE_NAME: table.tableName,
      },
    });

    table.grantReadWriteData(this.handler);
    props.downstream.grantInvoke(this.handler);
  }
}
