const { DynamoDB } = require('aws-sdk');
const { jsonResponse } = require('./response');

const TABLE_NAME = process.env.TABLE_NAME;
const PRIMARY_KEY = process.env.PRIMARY_KEY;
const dbClient = new DynamoDB.DocumentClient();

module.exports.handler = async (event) => {
    const spaceId = event.queryStringParameters?.[PRIMARY_KEY];

    if (!spaceId) {
        return jsonResponse(400, { message: `${PRIMARY_KEY} query parameter is required.` });
    }

    try {
        const deleteResult = await dbClient.delete({
            TableName: TABLE_NAME,
            Key: {
                [PRIMARY_KEY]: spaceId
            },
            ReturnValues: 'ALL_OLD'
        }).promise();

        if (!deleteResult.Attributes) {
            return jsonResponse(404, { message: 'Space not found.' });
        }

        return jsonResponse(200, {
            message: 'Space deleted.',
            item: deleteResult.Attributes
        });
    } catch (error) {
        console.log('DynamoDB delete error:', error);
        return jsonResponse(500, { message: 'Failed to delete space.' });
    }
};
