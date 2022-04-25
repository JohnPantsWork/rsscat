const router = require('express').Router();

const { wrapAsync } = require('../../util/util');
const { getExploreNews, getFeedNews } = require('../controller/news_controller');
const { sessionCheck } = require('../controller/user_controller');

router.route('/news').get(sessionCheck, wrapAsync(getExploreNews));
router.route('/news/user').get(sessionCheck, wrapAsync(getFeedNews));

module.exports = router;
