function jsonResponse(statusCode, body) {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE'
        },
        body: JSON.stringify(body)
    };
}

function parseJsonBody(event) {
    if (!event.body) {
        return {};
    }

    if (typeof event.body === 'object') {
        return event.body;
    }

    return JSON.parse(event.body);
}

module.exports = { jsonResponse, parseJsonBody };
