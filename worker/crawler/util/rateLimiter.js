require('dotenv').config();
const Cache = require('./cache');
const { RATE_LIMIT_WINDOW, RATE_LIMIT_COUNT } = process.env;
const QUOTA = RATE_LIMIT_COUNT || 100;
const WINDOW = RATE_LIMIT_WINDOW || 1;

async function rateLimiter(token) {
    let replies = await Cache.multi().set(token, 0, { EX: WINDOW, NX: true }).incr(token).exec();

    const reqCount = replies[1];
    if (reqCount > QUOTA) {
        return { status: 429, message: `Quota of ${QUOTA} per ${WINDOW}sec exceeded` };
    }
    return { status: 200, message: 'OK' };
}

const rateLimiterRoute = async (req, res, next) => {
    if (!Cache.ready) {
        // Redis is not connected
        return next();
    }
    try {
        const token = req.ip;
        let result = await rateLimiter(token);
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
