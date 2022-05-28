const internalMessages = {
    // start with 2 means response successfully, 4 means response with error, 5 means server error.
    // the second number point to service, which describe in this obj .

    // general 0
    4001: 'Page not found.',
    4002: 'API not found.',
    4003: 'Over rate limit.',
    5000: 'Server error, please contact the backend engineer.', // Replace every message send to frontend.

    // signup - 1
    2101: 'Native signup successfully.',
    4101: 'Required parameter missing.',
    4102: 'Email is not valid.',
    4103: 'Password is not valid.',
    4104: 'Username is not valid.',
    4105: 'Email has been used.',

    // signin - 2
    2201: 'Session check successfully.',
    2202: 'Native signin successfully.',
    2203: 'Signout successfully.',
    4201: 'Session check failure.',
    4202: 'Email or password is incorrect.',
    4203: 'Provider is missing.',
    4204: 'The provider is not supported.',

    // Oauth - 3
    2301: 'Oauth signup successfully.',
    2302: 'Oauth signin successfully.',
    4301: 'Oauth token is not valid.',
    4302: 'reCaptcha is not valid.',

    // cat, store - 4
    2401: 'Cat style changed success.',
    2402: 'Cat style purchased success.',
    2403: 'Response cat and user state successfully.',
    2404: 'Response missions successfully.',
    2405: 'Reward successfully.',
    4401: "User's money is not enough to purchased the item.",
    4402: 'This cat style is not purchased yet.',
    4403: 'Missions are expired.',

    // news, rss - 5
    2501: 'This url is valid, inserted into rss url db.',
    4501: 'This rss url is registered.',
    4502: 'This rss url is not safe.',
    4503: 'This url is not a valid rss url',
    4504: 'No articles',
    4505: 'This url is valid, but it doesnt have any article.',

    // tag, record - 6
    2601: 'Record insert successfully.',
    2602: 'Dislike an article successfully.',
    2603: 'Remove all records successfully.',
    4601: 'This tag is not exist.',
    4602: "This tag is not exist in user's tag list.",
};

module.exports = internalMessages;
