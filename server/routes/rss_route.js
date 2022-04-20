const router = require('express').Router();

const { wrapAsync } = require('../../util/util');
const { getExploreRss, getFeedRss } = require('../controller/rss_controller');

router.route('/rss').get(wrapAsync(getExploreRss));
router.route('/rss/user').post(wrapAsync(getFeedRss));

module.exports = router;
