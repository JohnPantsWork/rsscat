const router = require('express').Router();

const { wrapAsync } = require('../../util/util');
const { patchTags, getTags, postRecord, getRecord, patchRecord, deleteTags, deleteAllRecord } = require('../controller/tag_controller');
const { sessionCheck } = require('../controller/user_controller');

router.route('/user/tag').get(sessionCheck, wrapAsync(getTags));
router.route('/user/tag').patch(sessionCheck, wrapAsync(patchTags));
router.route('/user/tag').delete(sessionCheck, wrapAsync(deleteTags));

router.route('/record').get(sessionCheck, wrapAsync(getRecord));
router.route('/record').post(sessionCheck, wrapAsync(postRecord));
router.route('/record').patch(sessionCheck, wrapAsync(patchRecord));
router.route('/record').delete(sessionCheck, wrapAsync(deleteAllRecord));

module.exports = router;
