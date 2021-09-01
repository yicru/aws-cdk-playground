import { DynamoDB, Lambda } from "aws-sdk";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const dynamo = new DynamoDB();
  const lambda = new Lambda();

  const tableName = process.env.HITS_TABLE_NAME;
  const functionName = process.env.DOWNSTREAM_FUNCTION_NAME;

  if (!tableName || !functionName) {
    throw new Error("Not Specified TableName");
  }

  await dynamo
    .updateItem({
      TableName: tableName,
      Key: { path: { S: event.path } },
      UpdateExpression: "ADD hits :incr",
      ExpressionAttributeValues: { ":incr": { N: "1" } },
    })
    .promise();

  const response = await lambda
    .invoke({
      FunctionName: functionName,
      Payload: JSON.stringify(event),
    })
    .promise();

  console.log("downstream response:", JSON.stringify(response, undefined, 2));

  return JSON.parse(response.Payload as string);
}
