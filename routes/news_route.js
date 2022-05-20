const router = require('express').Router();

// internal functions
const { wrapAsync } = require('../../util/util');

// controllers
const { getExploreNews, getFeedNews } = require('../controller/news_controller');
const { sessionCheck, sessionSoftCheck } = require('../controller/user_controller');

// routers
router.route('/news').get(sessionSoftCheck, wrapAsync(getExploreNews));
router.route('/news/user').get(sessionCheck, wrapAsync(getFeedNews));

module.exports = router;
