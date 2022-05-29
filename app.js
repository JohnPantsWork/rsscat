require('dotenv').config();
const { APP_PORT, API_VERSION, SESSION_SECRET, COOKIE_SECRET } = process.env;
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const connectRedis = require('connect-redis')(session);
// const MorganBody = require('morgan-body');
const cache = require('./util/cache');
const errorHandler = require('./util/errorHandler');
const { rateLimiterRoute } = require('./util/rateLimiter');
// const Logger = require('./util/logger');

const app = express();
app.set('trust proxy', true);
app.set('json spaces', 2);
app.use(
    cors({
        credentials: true,
        origin: [
            'http://127.0.0.1',
            'http://localhost:3000',
            'http://www.rsscat.net',
            'https://www.rsscat.net',
            'http://api.rsscat.net',
            'https://api.rsscat.net',
        ],
    })
);
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(COOKIE_SECRET));
app.use(
    session({
        store: new connectRedis({ client: cache }),
        secret: SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        name: 'usid',
    })
);

// send morgan message to aws cloudwatch
// MorganBody(app, {
//     stream: {
//         write: (message) => {
//             if (message !== '') {
//                 Logger.info(message);
//             }
//         },
//     },
// });

// rate limiter
app.use(rateLimiterRoute);

// API routes
app.use('/api/' + API_VERSION, [
    require('./routes/user_route'),
    require('./routes/rss_route'),
    require('./routes/news_route'),
    require('./routes/tag_route'),
    require('./routes/cat_route'),
]);

// API not found
app.get(`/api/${API_VERSION}/*`, (req, res, next) => {
    return next(errorHandler(404, 4002));
});

// Page not found.
app.get('*', (req, res, next) => {
    return next(errorHandler(404, 4001));
});

// Server error
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error(err);
    return res.status(err.httpStatusCode).json({ error: err.message });
});

app.listen(APP_PORT, async () => {
    console.info(`Listening on port: ${APP_PORT}`);
});
