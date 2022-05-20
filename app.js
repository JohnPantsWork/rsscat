// env
require('dotenv').config();
const { APP_PORT, API_VERSION, SESSION_SECRET, COOKIE_SECRET } = process.env;

// npm
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const redisStore = require('connect-redis')(session);
const MorganBody = require('morgan-body');

// internal functions
const cache = require('./util/cache');
const { newErrRes } = require('./util/util');
const { rateLimiterRoute } = require('./util/rateLimiter');
const Logger = require('./util/logger');

// const
const app = express();

app.set('trust proxy', true);
app.set('json spaces', 2);
app.use(
    cors({
        credentials: true,
        origin: [
            'http://localhost:3000',
            'http://rsscat.net',
            'https://rsscat.net',
            'http://127.0.0.1',
        ],
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
        name: 'usid',
    })
);

// send morgan message to aws cloudwatch
MorganBody(app, {
    stream: {
        write: (message) => {
            if (message !== '') {
                Logger.info(message);
            }
        },
    },
});

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
app.get('/api/1.0/*', (req, res, next) => {
    return next(newErrRes(404, { statusCode: 40402, msg: "API doesn't exist." }));
});

// 404
app.get('*', (req, res, next) => {
    return next(newErrRes(404, { statusCode: 40401, msg: 'Page not found.' }));
});

// 500
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    if (err.status === 500) {
        console.error(err);
        return res.status(500).json({
            error: {
                statusCode: 50000,
                msg: 'Server error, please contact the backend engineer.',
            },
        });
    }
    console.error(err.message);
    return res.status(err.status).json({ error: err.message });
});

app.listen(APP_PORT, async () => {
    console.info(`Listening on port: ${APP_PORT}`);
});
