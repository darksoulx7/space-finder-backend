const { DynamoDB } = require('aws-sdk');
const { v4 } = require('uuid')

const dbClient = new DynamoDB.DocumentClient();

const TABLE_NAME = process.env.TABLE_NAME
module.exports.handler = async (event, context) => {

    const result = {
        statusCode: 200,
        body: "In dynamodb"
    }

    try {
        const queryResponse = await dbClient.scan({
            TableName: TABLE_NAME,
           
        }).promise();
        result.body = JSON.stringify(queryResponse) 
    } catch (error) {
        console.log("error ===========>", error)
        result.body = error.message;
    }
   

    return result;

}