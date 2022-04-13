require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Cache = require('./util/cache');
// const logger = require('./log/logger');
// const morganBody = require('morgan-body');
// const { rateLimiterRoute } = require('./util/ratelimiter');

const app = express();
const { APP_PORT, API_VERSION } = process.env;
app.set('trust proxy', true);
app.set('json spaces', 2);
app.use(cors());
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(document));

// send morgan message to aws cloudwatch
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

// API routes
app.use('/api/' + API_VERSION, /*rateLimiterRoute,*/ [require('./server/routes/main_route')]);

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

app.listen(APP_PORT, async () => {
  console.log(`Listening on port: ${APP_PORT}`);
});
