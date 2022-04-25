const router = require('express').Router();

const { wrapAsync } = require('../../util/util');
const { postTags, getTags, postRecord } = require('../controller/tag_controller');
const { sessionCheck } = require('../controller/user_controller');

router.route('/tag').post(sessionCheck, wrapAsync(postTags));
router.route('/tag').get(sessionCheck, wrapAsync(getTags));

router.route('/tag/record').post(sessionCheck, wrapAsync(postRecord));

module.exports = router;
