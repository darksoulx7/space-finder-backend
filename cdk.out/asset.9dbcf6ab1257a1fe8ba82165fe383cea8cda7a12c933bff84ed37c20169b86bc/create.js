const { DynamoDB } = require('aws-sdk') ;

const { v4}  = require('uuid');

const dbClient = new DynamoDB.DocumentClient();


module.exports.handler = async (event, context) => {

console.log("hello",event);
const result = {
  statusCode: 200,
  body: "Hello from DYnamoDb",
};

const item = typeof event.body === "object" ? event.body : JSON.parse(event.body);
item.spaceId = v4();

try {
  await dbClient
    .put({
      TableName: "SpacesTable",
      Item: item,
    })
    .promise().then(()=> {
      console.log("suscess")
    }).catch((error)=> console.log('dynamodb eeoeeo', error));
} catch (error) {
  result.body = error.message;
}
result.body = JSON.stringify(item.spaceId);

return result;

};
