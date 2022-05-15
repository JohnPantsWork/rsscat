const router = require('express').Router();

const { wrapAsync } = require('../../util/util');
const { getExploreRss, getFeedRss, getLikedRssDomain, patchLikedRssDomain, deleteLikedRssDomain, getAllRssDomain, postNewRss } = require('../controller/rss_controller');
const { sessionCheck, sessionSoftCheck } = require('../controller/user_controller');

router.route('/rss').get(sessionSoftCheck, wrapAsync(getExploreRss));

router.route('/rss/user').get(sessionCheck, wrapAsync(getFeedRss));

router.route('/user/domain').get(sessionCheck, wrapAsync(getLikedRssDomain));
router.route('/user/domain').patch(sessionCheck, wrapAsync(patchLikedRssDomain));
router.route('/user/domain').delete(sessionCheck, wrapAsync(deleteLikedRssDomain));

router.route('/rss/domain').get(wrapAsync(getAllRssDomain));
router.route('/rss/domain').post(sessionCheck, wrapAsync(postNewRss));

module.exports = router;
