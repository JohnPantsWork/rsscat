const cache = require('./cache');

const queue = {
    get: async function () {
        return await cache.brpop('missions', 1000);
    },
};

module.exports = queue;
