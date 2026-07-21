const { v4: uuidv4 } = require('uuid');

function generateRandomId() {
    return uuidv4();
}

module.exports = { generateRandomId };
