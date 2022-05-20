// env
require('dotenv').config();
const { CACHE_HOST, CACHE_PORT, CACHE_USER, CACHE_PASSWORD } = process.env;

// npm
const Ioredis = require('ioredis');

const redisCli = new Ioredis({
    port: CACHE_PORT,
    host: CACHE_HOST,
    username: CACHE_USER,
    password: CACHE_PASSWORD,
    db: 0,
});

// for checking if Redis is connecting or not.
redisCli.ready = false;

redisCli.on('ready', () => {
    redisCli.ready = true;
});

redisCli.on('error', (err) => {
    redisCli.ready = false;
    console.info('Error in Redis');
    console.error(err);
});

redisCli.on('end', () => {
    redisCli.ready = false;
    console.info('Redis is disconnected');
});

module.exports = redisCli;
