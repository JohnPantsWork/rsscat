require('dotenv').config();
const Redis = require('ioredis');
const { CACHE_HOST, CACHE_PORT, CACHE_USER, CACHE_PASSWORD } = process.env;

console.log(CACHE_HOST, CACHE_PORT, CACHE_USER, CACHE_PASSWORD);

//const redisClient = redis.createClient({
//  url: `redis://${CACHE_USER}@${CACHE_HOST}:${CACHE_PORT}`,
//  socket: {
//    keepAlive: false,
//  },
//});

const redisClient = new Redis({
  port: CACHE_PORT, // Redis port
  host: CACHE_HOST, // Redis host
  username: CACHE_USER, // needs Redis >= 6
  password: CACHE_PASSWORD,
  db: 0, // Defaults to 0
});

console.log(`#redisClient#`, redisClient);

// use to check if redis is alive or not.
redisClient.ready = false;

redisClient.on('ready', () => {
  redisClient.ready = true;
  console.log('Redis is ready');
});

redisClient.on('error', (err) => {
  redisClient.ready = false;
  //  if (process.env.NODE_ENV == 'production') {
  console.log('Error in Redis');
  console.log(err);
  //  }
});

redisClient.on('end', () => {
  redisClient.ready = false;
  console.log('Redis is disconnected');
});

module.exports = redisClient;
