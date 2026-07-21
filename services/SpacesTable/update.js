const { DynamoDB } = require('aws-sdk');
const { jsonResponse, parseJsonBody } = require('./response');
const dbClient = new DynamoDB.DocumentClient();

const TABLE_NAME = process.env.TABLE_NAME;
const PRIMARY_KEY = process.env.PRIMARY_KEY;

module.exports.handler = async (event) => {
    const spaceId = event.queryStringParameters?.[PRIMARY_KEY];

    if (!spaceId) {
        return jsonResponse(400, { message: `${PRIMARY_KEY} query parameter is required.` });
    }

    let reqBody;
    try {
        reqBody = parseJsonBody(event);
    } catch (error) {
        return jsonResponse(400, { message: 'Request body must be valid JSON.' });
    }

    const updateKeys = Object.keys(reqBody || {}).filter((key) => key !== PRIMARY_KEY);
    if (updateKeys.length === 0) {
        return jsonResponse(400, { message: 'At least one non-primary-key field is required.' });
    }

    const expressionAttributeNames = {};
    const expressionAttributeValues = {};
    const updateExpressions = updateKeys.map((key, index) => {
        const nameKey = `#field${index}`;
        const valueKey = `:value${index}`;
        expressionAttributeNames[nameKey] = key;
        expressionAttributeValues[valueKey] = reqBody[key];
        return `${nameKey} = ${valueKey}`;
    });

    try {
        const updateResult = await dbClient.update({
            TableName: TABLE_NAME,
            Key: {
                [PRIMARY_KEY]: spaceId
            },
            UpdateExpression: `SET ${updateExpressions.join(', ')}`,
            ConditionExpression: 'attribute_exists(#primaryKey)',
            ExpressionAttributeNames: {
                ...expressionAttributeNames,
                '#primaryKey': PRIMARY_KEY
            },
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'ALL_NEW'
        }).promise();

        return jsonResponse(200, {
            message: 'Space updated.',
            item: updateResult.Attributes
        });
    } catch (error) {
        if (error.code === 'ConditionalCheckFailedException') {
            return jsonResponse(404, { message: 'Space not found.' });
        }

        console.log('DynamoDB update error:', error);
        return jsonResponse(500, { message: 'Failed to update space.' });
    }
};
