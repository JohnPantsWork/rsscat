const router = require('express').Router();

const { wrapAsync } = require('../../util/util');
const { getExploreRss, getFeedRss, getRssDomainName, postLikedRssDomain, postNewRss } = require('../controller/rss_controller');
const { sessionCheck } = require('../controller/user_controller');

router.route('/rss').get(sessionCheck, wrapAsync(getExploreRss));
router.route('/rss').post(sessionCheck, wrapAsync(postNewRss));
router.route('/rss/user').get(sessionCheck, wrapAsync(getFeedRss));
router.route('/rss/domain').get(sessionCheck, wrapAsync(getRssDomainName));
router.route('/rss/domain').post(sessionCheck, wrapAsync(postLikedRssDomain));

module.exports = router;
