const { DynamoDB } = require('aws-sdk');
const dbClient = new DynamoDB.DocumentClient();

const TABLE_NAME = process.env.TABLE_NAME
const PRIMARY_KEY = process.env.PRIMARY_KEY

module.exports.handler = async (event, context) => {

  const reqBody = typeof event.body == 'object' ? event.body : JSON.parse(event.body)
  const spaceId = event.queryStringParameters?.[PRIMARY_KEY]

  try {
    const result = {
      statusCode: 200,
      body: "in dynamodb"
    }

    if (reqBody && spaceId) {
      const requestBodyKey = Object.keys(reqBody)[0]
      const requestBodyValue = reqBody[requestBodyKey]

      const updateResult = await dbClient.update({
        TableName: TABLE_NAME,
        Key: {
          [PRIMARY_KEY]: spaceId
        },
        UpdateExpression: 'set #zzzz = :new',
        ExpressionAttributeNames: {
          '#zzzz': requestBodyKey
        },
        ExpressionAttributeValues: {
          ":new": requestBodyValue
        },
        ReturnValues: 'UPDATED_NEW'
      }).promise()

      result.body = JSON.stringify(updateResult)
      return result;
    }
  } catch (error) {
    console.log("error", error)
  }

}

