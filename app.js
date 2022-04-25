require('dotenv').config();
const { APP_PORT, API_VERSION, SESSION_SECRET, COOKIE_SECRET, GOOGLE_RECAPTCHA_EMAIL, GOOGLE_RECAPTCHA_PRIVATE_KEY, GOOGLE_RECAPTCHA_PROJECT_ID, GOOGLE_RECAPTCHA_SITE_KEY } = process.env;
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const redisStore = require('connect-redis')(session);
const cache = require('./util/cache');
// const logger = require('./log/logger');
// const morganBody = require('morgan-body');
// const { rateLimiterRoute } = require('./util/ratelimiter');

const app = express();
app.set('trust proxy', true);
app.set('json spaces', 2);
app.use(
  cors({
    credentials: true,
    origin: ['http://localhost:3000', 'http://rsscat.net', 'https://rsscat.net'],
  })
);
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(COOKIE_SECRET));
app.use(
  session({
    store: new redisStore({ client: cache }),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

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
app.use(
  '/api/' + API_VERSION,
  /*rateLimiterRoute,*/ [
    require('./server/routes/word_route'),
    require('./server/routes/user_route'),
    require('./server/routes/rss_route'),
    require('./server/routes/news_route'),
    require('./server/routes/tag_route'),
    require('./server/routes/test_route'),
  ]
);

// 404
app.get('*', (req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// 500
app.use((err, req, res, next) => {
  console.error(err);
  console.log(`#err.message#`, err);
  res.status(err.status || 500);
  res.json({ error: err.message });
});

app.listen(APP_PORT, async () => {
  console.log(`Listening on port: ${APP_PORT}`);
});
