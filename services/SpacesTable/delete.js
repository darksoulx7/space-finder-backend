const { DynamoDB } = require('aws-sdk');


const TABLE_NAME = process.env.TABLE_NAME ;
const PRIMARY_KEY = process.env.PRIMARY_KEY ;
const dbClient = new DynamoDB.DocumentClient();

module.exports.handler = async (event, context) => {

    const result= {
        statusCode: 200,
        body: 'Hello from DYnamoDb'
    }

    const spaceId = event.queryStringParameters?.[PRIMARY_KEY]

    if (spaceId) {
        const deleteResult = await dbClient.delete({
            TableName: TABLE_NAME,
            Key: {
                [PRIMARY_KEY]: spaceId
            }
        }).promise();
        result.body = JSON.stringify(deleteResult);
    }

    return result
}

