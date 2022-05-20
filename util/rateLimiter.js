// env
require('dotenv').config();
const { RATE_LIMIT_WINDOW, RATE_LIMIT_COUNT } = process.env;

// internal functions
const Cache = require('./cache');

async function RateLimiter(ip) {
    let replies = await Cache.multi()
        .set(`rateLimiter:${ip}`, 0, { EX: RATE_LIMIT_WINDOW, NX: true })
        .incr(ip)
        .exec();

    const reqCount = replies[1];
    if (reqCount > RATE_LIMIT_COUNT) {
        return {
            status: 429,
            message: `Quota of ${RATE_LIMIT_COUNT} per ${RATE_LIMIT_WINDOW}sec exceeded`,
        };
    }
    return { status: 200, message: 'OK' };
}

const rateLimiterRoute = async (req, res, next) => {
    if (!Cache.ready) {
        return next();
    }
    try {
        let result = await RateLimiter(req.ip);
        if (result.status == 200) {
            return next();
        } else {
            res.status(result.status).send(result.message);
            return;
        }
    } catch (e) {
        return next();
    }
};

module.exports = { rateLimiterRoute };
