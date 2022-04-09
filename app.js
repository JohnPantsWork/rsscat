require('dotenv').config();
const express = require('express');
const { PORT_TEST, PORT, NODE_ENV, API_VERSION } = process.env;
const port = NODE_ENV == 'test' ? PORT_TEST : PORT;
const logger = require('./util/logger/ec2Logger');
const morganBody = require('morgan-body');
const { rateLimiterRoute } = require('./util/ratelimiter');
const Cache = require('./util/cache');

// Express Initialization
const cors = require('cors');
const app = express();

// RESTFUL api document
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(document));

//socket.io
const http = require('http');
const server = http.createServer(app);
require('./server/socket/socket').campaign(server);
// morgan message to aws cloudwatch
// const loggerStream = {
//     write: (message) => {
//         if (message !== '') {
//             logger.info(message);
//         }
//     },
// };
// morganBody(app, {
//     stream: loggerStream,
// });
// morganBody(app);

app.set('trust proxy', true);
// app.set('trust proxy', 'loopback');
app.set('json spaces', 2);

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS allow all
app.use(cors());

// API routes
app.use('/api/' + API_VERSION, rateLimiterRoute, [require('./server/routes/main_route')]);

// 404
app.get('*', (req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// 500
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500);
  res.json({ error: err.message });
});

if (NODE_ENV != 'production') {
  server.listen(port, async () => {
    Cache.connect().catch(() => {
      console.log('redis connect fail');
    });
    console.log(`Listening on port: ${port}`);
  });
}
