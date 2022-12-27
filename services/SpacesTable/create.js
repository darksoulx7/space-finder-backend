const { DynamoDB } = require('aws-sdk');
const { v4 } = require('uuid')

const dbClient = new DynamoDB.DocumentClient();


module.exports.handler = async (event, context) => {

  const result = {
    statusCode: 200,
    body: "in dynamodb"
  }
  // const item = {
  //   spaceId: v4(),
  //   name: v4()
  // }

  const item = typeof event.body == 'object'?event.body:JSON.parse(event.body)
  item.spaceId =  v4() 

  try {
    await dbClient.put({
        TableName: "SpacesTable",
        Item: item,
      }).promise().then(() => {
        console.log("suscess")
      }).catch((error) => console.log('dynamodb error', error));
  } catch (error) {
    console.log("error ===========>", error)
    result.body = error.message;
  }
  result.body = JSON.stringify(`Created item with id: ${item.spaceId}`);

  return result;

}

