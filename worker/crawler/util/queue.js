const cache = require('./cache');

const queue = {
    get: async function () {
        console.log(`#--------------------[1]#\n`);
        return await cache.brpop('missions', 1000);
    },
};

module.exports = queue;
