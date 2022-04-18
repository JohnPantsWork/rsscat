const router = require('express').Router();

const { wrapAsync } = require('../../util/util');
const { getExploreRss } = require('../controller/rss_controller');

router.route('/rss').get(wrapAsync(getExploreRss));

module.exports = router;
