const router = require('express').Router();

// internal functions
const { wrapAsync } = require('../util/utils');

// controllers
const {
    getUserTag,
    patchUserTag,
    getRecord,
    postRecord,
    patchRecord,
    deleteRecord,
} = require('../controller/tag_controller');
const { checkSession } = require('../controller/user_controller');

// routers
router.route('/user/tag').get(checkSession, wrapAsync(getUserTag));
router.route('/user/tag').patch(checkSession, wrapAsync(patchUserTag));
router.route('/record').get(checkSession, wrapAsync(getRecord));
router.route('/record').post(checkSession, wrapAsync(postRecord));
router.route('/record').patch(checkSession, wrapAsync(patchRecord));
router.route('/record').delete(checkSession, wrapAsync(deleteRecord));

module.exports = router;
