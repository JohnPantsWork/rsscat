const internalMessages = require('../data/internalMessages');

class errorHandler extends Error {
    constructor(httpStatusCode, internalStatusCode, message = null) {
        // if httCode equals 500, it means the error message should only expose to the backend.
        super(internalMessages[internalStatusCode]);
        this.httpStatusCode = httpStatusCode;
        this.internalStatusCode = internalStatusCode;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, errorHandler);
        }
        if (httpStatusCode === 500) {
            console.error(`#errorMessage#`, message);
            console.error(`#errorMessage#`, this.stack);
        }
    }
}

module.exports = errorHandler;
