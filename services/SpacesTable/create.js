const { DynamoDB } = require('aws-sdk');
const dbClient = new DynamoDB.DocumentClient();
const {generateRandomId} = require('../Shared/Utils')
const TABLE_NAME = process.env.TABLE_NAME
module.exports.handler = async (event, context) => {

  const result = {
    statusCode: 200,
    body: "in dynamodb"
  }

  const item = typeof event.body == 'object'?event.body:JSON.parse(event.body)
  item.spaceId =  generateRandomId() 

  try {
    await dbClient.put({
        TableName: TABLE_NAME,
        Item: item,
      }).promise().then(() => {
        console.log("success")
      }).catch((error) => console.log('dynamodb error', error));
  } catch (error) {
    console.log("error:", error)
    result.body = error.message;
  }
  result.body = JSON.stringify(`Created item with id: ${item.spaceId}`);

  return result;

}

