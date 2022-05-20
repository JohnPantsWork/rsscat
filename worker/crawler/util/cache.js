require('dotenv').config();
const Redis = require('ioredis');
const { CACHE_HOST, CACHE_PORT, CACHE_USER, CACHE_PASSWORD } = process.env;

const redisClient = new Redis({
    port: CACHE_PORT,
    host: CACHE_HOST,
    username: CACHE_USER,
    password: CACHE_PASSWORD,
    db: 0,
});

// use to check if redis is alive or not.
redisClient.ready = false;

redisClient.on('ready', () => {
    redisClient.ready = true;
});

redisClient.on('error', (err) => {
    redisClient.ready = false;
    console.info('Error in Redis');
    console.error(err);
});

redisClient.on('end', () => {
    redisClient.ready = false;
    console.info('Redis is disconnected');
});

module.exports = redisClient;
