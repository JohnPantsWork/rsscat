const router = require('express').Router();

// internal functions
const { wrapAsync } = require('../util/utils');

// controllers
const { getNews, getUserNews } = require('../controller/news_controller');
const { checkSession, checkSessionNotStrict } = require('../controller/user_controller');

// routers
router.route('/news').get(checkSessionNotStrict, wrapAsync(getNews));
router.route('/user/news').get(checkSession, wrapAsync(getUserNews));

module.exports = router;
