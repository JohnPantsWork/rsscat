const internalMessages = {
    // start with 2 means response successfully, 4 means response with error, 5 means server error.
    // the second number point to service, which describe in this obj .

    // general 0
    4001: 'Page not found.',
    4002: 'API not found.',
    5000: 'Server error, please contact the backend engineer.', // Replace every message send to frontend.

    // worker - 7
};

module.exports = internalMessages;
