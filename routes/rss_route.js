const router = require('express').Router();

// internal functions
const { wrapAsync } = require('../../util/util');

// controllers
const {
    getExploreRss,
    getFeedRss,
    getAllRssDomain,
    postNewRss,
    getLikedRssDomain,
    patchLikedRssDomain,
    deleteLikedRssDomain,
} = require('../controller/rss_controller');
const { sessionCheck, sessionSoftCheck } = require('../controller/user_controller');

// routers
router.route('/rss').get(sessionSoftCheck, wrapAsync(getExploreRss));
router.route('/rss/user').get(sessionCheck, wrapAsync(getFeedRss));
router.route('/rss/domain').get(wrapAsync(getAllRssDomain));
router.route('/rss/domain').post(sessionCheck, wrapAsync(postNewRss));
router.route('/user/domain').get(sessionCheck, wrapAsync(getLikedRssDomain));
router.route('/user/domain').patch(sessionCheck, wrapAsync(patchLikedRssDomain));
router.route('/user/domain').delete(sessionCheck, wrapAsync(deleteLikedRssDomain));

module.exports = router;
