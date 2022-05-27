const router = require('express').Router();

// internal functions
const { wrapAsync } = require('../util/utils');

// controllers
const {
    getRss,
    getUserRss,
    getRssDomain,
    postRssDomain,
    getUserDomain,
    putUserDomain,
    patchUserDomain,
} = require('../controller/rss_controller');
const { checkSession, checkSessionNotStrict } = require('../controller/user_controller');

// routers
router.route('/rss').get(checkSessionNotStrict, wrapAsync(getRss));
router.route('/user/rss').get(checkSession, wrapAsync(getUserRss));
router.route('/rss/domain').get(checkSessionNotStrict, wrapAsync(getRssDomain));
router.route('/rss/domain').post(checkSession, wrapAsync(postRssDomain));
router.route('/user/domain').get(checkSession, wrapAsync(getUserDomain));
router.route('/user/domain').put(checkSession, wrapAsync(putUserDomain));
router.route('/user/domain').patch(checkSession, wrapAsync(patchUserDomain));

module.exports = router;
