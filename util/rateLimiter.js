require('dotenv').config();
const { RATE_LIMIT_WINDOW, RATE_LIMIT_COUNT } = process.env;
const Cache = require('./cache');
const errorHandler = require('../util/errorHandler');

const rateLimiter = async (ip) => {
    const username = `userip:${ip}`;
    let cache = await Cache.incr(username);
    if (cache === 1) {
        await Cache.expire(username, RATE_LIMIT_WINDOW);
    }

    if (cache > RATE_LIMIT_COUNT) {
        throw new errorHandler(429, 4003);
    }
};

const rateLimiterRoute = async (req, res, next) => {
    if (!Cache.ready) {
        return next();
    }
    try {
        await rateLimiter(req.ip);
        return next();
    } catch (err) {
        return next(err);
    }
};

module.exports = { rateLimiterRoute };
