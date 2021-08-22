/**
 * A Lambda function that gets triggered from Step Functions.
 */
const AWS = require("aws-sdk")
const dynamodb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });
const lambda = new AWS.Lambda()
exports.stepFunctionTrigger = async(event, context) => {
    let index = event.iterator.index + 1
    let params = {
        FunctionName: "DynamoDBQueryAndScanOperations",
        InvocationType: "Event"
    }
    lambda.invoke(params).promise()
    return {
        'index': index,
        'continue': index < event['iterator']['count'],
        'count': event['iterator']['count']
    }
}
