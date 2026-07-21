const { DynamoDB } = require('aws-sdk');
const dbClient = new DynamoDB.DocumentClient();
const { generateRandomId } = require('../Shared/Utils');
const { jsonResponse, parseJsonBody } = require('./response');

const TABLE_NAME = process.env.TABLE_NAME;
const PRIMARY_KEY = process.env.PRIMARY_KEY;

module.exports.handler = async (event) => {
    let item;

    try {
        item = parseJsonBody(event);
    } catch (error) {
        return jsonResponse(400, { message: 'Request body must be valid JSON.' });
    }

    if (!item || Object.keys(item).length === 0) {
        return jsonResponse(400, { message: 'Request body is required.' });
    }

    item[PRIMARY_KEY] = item[PRIMARY_KEY] || generateRandomId();

    try {
        await dbClient.put({
            TableName: TABLE_NAME,
            Item: item,
            ConditionExpression: 'attribute_not_exists(#primaryKey)',
            ExpressionAttributeNames: {
                '#primaryKey': PRIMARY_KEY
            }
        }).promise();

        return jsonResponse(201, {
            message: `Created item with id: ${item[PRIMARY_KEY]}`,
            item
        });
    } catch (error) {
        console.log('DynamoDB create error:', error);
        return jsonResponse(500, { message: 'Failed to create space.' });
    }
};
