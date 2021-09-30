/**
 * A Lambda function that queries DynamoDB and updates CloudWatch Custom metrics with the time taken for each DynamoDB operation.
 */
const AWS = require("aws-sdk")
const dynamodb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });
const cloudwatch = new AWS.CloudWatch()

const custom_cloudwatch_metric = async(metric, value) => {
    await cloudwatch.putMetricData({
        'MetricData': [{
            'MetricName': 'LambdaProcessor',
            'Dimensions': [{
                    'Name': 'OPERATION',
                    'Value': metric
                },
                {
                    'Name': 'LambdaMemory',
                    'Value': process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE
                },
                {
                    'Name': 'LambdaProcessor',
                    'Value': process.env.lambda_fn_arch
                }
            ],
            'Unit': 'Milliseconds',
            'Value': value
        }, ],
        'Namespace': 'Lambda Process Metrics'
    }).promise()
}

exports.dynamoQueryAndScan = async(event, context) => {
    let start_time = Date.now()
    await scan_dynamo()
    await query_dynamo()
    let end_time = Date.now()
    console.log("Lambda execution with DynamoDB Scan and Query : ", end_time - start_time)
    return {
        "status": 200
    }

}

const scan_dynamo = async() => {
    let start_time = Date.now()
    let scanResponse = await dynamodb.scan({
        "TableName": "cars-demo"
    }).promise()
    let end_time = Date.now()
    console.log("DynamoDB Scan : ", end_time - start_time)
    await custom_cloudwatch_metric("SCAN", end_time - start_time)
    return "SUCCESS"
}

const query_dynamo = async() => {
    let start_time = Date.now()
    let queryResponse = await dynamodb.query({
        TableName: 'cars-demo',
        IndexName: 'origin-index',
        KeyConditionExpression: 'origin = :origin',
        ExpressionAttributeValues: { ':origin': { "S": "USA" } },
    }).promise()
    let end_time = Date.now()
    console.log("DynamoDB Query : ", end_time - start_time)
    await custom_cloudwatch_metric("QUERY", end_time - start_time)
    return "SUCCESS"
}
