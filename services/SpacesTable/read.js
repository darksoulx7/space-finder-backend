const { DynamoDB } = require('aws-sdk');
const { jsonResponse } = require('./response');

const dbClient = new DynamoDB.DocumentClient();

const TABLE_NAME = process.env.TABLE_NAME;
const PRIMARY_KEY = process.env.PRIMARY_KEY;
const SUPPORTED_INDEXES = new Set((process.env.SECONDARY_INDEXES || '').split(',').filter(Boolean));
const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

module.exports.handler = async (event) => {
    try {
        const queryParams = event.queryStringParameters || {};

        if (PRIMARY_KEY in queryParams) {
            return jsonResponse(200, await queryWithPrimaryPartition(queryParams));
        }

        const indexKey = Object.keys(queryParams).find((key) => SUPPORTED_INDEXES.has(key));
        if (indexKey) {
            return jsonResponse(200, await queryWithGlobalSecondaryIndex(indexKey, queryParams[indexKey], queryParams));
        }

        const filterKeys = Object.keys(queryParams).filter((key) => !['limit', 'nextToken'].includes(key));
        if (filterKeys.length > 0) {
            return jsonResponse(400, { message: `Unsupported query parameter: ${filterKeys[0]}` });
        }

        return jsonResponse(200, await scanTable(queryParams));
    } catch (error) {
        console.log('DynamoDB read error:', error);
        return jsonResponse(500, { message: 'Failed to read spaces.' });
    }
};

async function scanTable(queryParams) {
    const queryResponse = await dbClient.scan({
        TableName: TABLE_NAME,
        Limit: getLimit(queryParams.limit),
        ExclusiveStartKey: decodeNextToken(queryParams.nextToken)
    }).promise();

    return formatCollectionResponse(queryResponse);
}

async function queryWithPrimaryPartition(queryParams) {
    const keyValue = queryParams[PRIMARY_KEY];
    const queryResponse = await dbClient.query({
        TableName: TABLE_NAME,
        KeyConditionExpression: '#pk = :pk',
        ExpressionAttributeNames: {
            '#pk': PRIMARY_KEY
        },
        ExpressionAttributeValues: {
            ':pk': keyValue
        },
        Limit: getLimit(queryParams.limit),
        ExclusiveStartKey: decodeNextToken(queryParams.nextToken)
    }).promise();

    return formatCollectionResponse(queryResponse);
}

async function queryWithGlobalSecondaryIndex(queryKey, queryValue, queryParams) {
    const queryResponse = await dbClient.query({
        TableName: TABLE_NAME,
        IndexName: queryKey,
        KeyConditionExpression: '#gsi = :gsiValue',
        ExpressionAttributeNames: {
            '#gsi': queryKey
        },
        ExpressionAttributeValues: {
            ':gsiValue': queryValue
        },
        Limit: getLimit(queryParams.limit),
        ExclusiveStartKey: decodeNextToken(queryParams.nextToken)
    }).promise();

    return formatCollectionResponse(queryResponse);
}

function getLimit(limit) {
    const parsedLimit = Number(limit || DEFAULT_LIMIT);
    if (Number.isNaN(parsedLimit) || parsedLimit < 1) {
        return DEFAULT_LIMIT;
    }
    return Math.min(parsedLimit, MAX_LIMIT);
}

function decodeNextToken(nextToken) {
    if (!nextToken) {
        return undefined;
    }

    return JSON.parse(Buffer.from(nextToken, 'base64').toString('utf8'));
}

function encodeNextToken(lastEvaluatedKey) {
    if (!lastEvaluatedKey) {
        return undefined;
    }

    return Buffer.from(JSON.stringify(lastEvaluatedKey)).toString('base64');
}

function formatCollectionResponse(queryResponse) {
    return {
        items: queryResponse.Items || [],
        nextToken: encodeNextToken(queryResponse.LastEvaluatedKey)
    };
}
