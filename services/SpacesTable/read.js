const { DynamoDB } = require('aws-sdk');
const { v4 } = require('uuid')

const dbClient = new DynamoDB.DocumentClient();

const TABLE_NAME = process.env.TABLE_NAME
const PRIMARY_KEY = process.env.PRIMARY_KEY
module.exports.handler = async (event, context) => {

    const result = {
        statusCode: 200,
        body: "In dynamodb"
    }

    try {

        if(event.queryStringParameters) {
            console.log(event.queryStringParameters);
            if (PRIMARY_KEY in event.queryStringParameters) {
                result.body = await queryWithPrimaryPartition(event.queryStringParameters)
            } else  {
                result.body  = await querywithGlobalSecondaryIndexes(event.queryStringParameters)
            }
        } else {
            result.body = await sacnTable() 
        }
    } catch (error) {
        console.log("error:", error)
        result.body = error.message;
    }
    return result;
}

async function  sacnTable(){
    const queryResponse = await dbClient.scan({
        TableName: TABLE_NAME,
    }).promise();
    return  JSON.stringify(queryResponse.Items)
}


async function queryWithPrimaryPartition (queryParams){
    const keyValue = queryParams[PRIMARY_KEY];
    const queryResponse = await dbClient.query({
        TableName: TABLE_NAME,
        KeyConditionExpression: '#zz = :zzzz',
        ExpressionAttributeNames: {
            '#zz': PRIMARY_KEY
        },
        ExpressionAttributeValues: {
            ':zzzz': keyValue
        }
    }).promise();
    return JSON.stringify(queryResponse.Items);
}


async function querywithGlobalSecondaryIndexes(queryParams) {
    console.log("Queryparam:", queryParams);
    const queryKey = Object.keys(queryParams)[0]
    const queryValue = queryParams[queryKey]
    const queryResponse = await dbClient.query({
        TableName: TABLE_NAME,
        IndexName: queryKey,
        KeyConditionExpression: `#zzzz= :zz`,
        ExpressionAttributeNames: {
            '#zzzz': queryKey
        },
        ExpressionAttributeValues: {
            ':zz': queryValue
        }
    }).promise()
    return JSON.stringify(queryResponse.Items)

}

async function querywithGlobalSecondaryIndexees(queryParams) {
    console.log("Queryparam:", queryParams);

    

    const queryKey = Object.keys(queryParams)[0]
    const queryValue = queryParams[queryKey]

    const queryKey1 = Object.keys(queryParams)[1]
    const queryValue1 = queryParams[queryKey1]
    const queryResponse = await dbClient.scan({
        TableName: TABLE_NAME,
        FilterExpression: "contains(#aaaa,:aa) AND #bbbb = :bb",
        ExpressionAttributeNames: {
            '#aaaa': queryKey, '#bbbb': queryKey1
        },
        ExpressionAttributeValues: {
            ':aa': queryValue, ':bb': queryValue1
        }
    }).promise()

    return JSON.stringify(queryResponse.Items)

}