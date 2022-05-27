const router = require('express').Router();
const { wrapAsync } = require('../util/utils');
const {
    checkSession,
    checkReCaptcha,
    getUser,
    postUserSignOut,
    getUserCheck,
    postUserSignUp,
    postUserSignIn,
} = require('../controller/user_controller');

// routers
router.route('/user').get(checkSession, wrapAsync(getUser));
router.route('/user/check').get(checkSession, wrapAsync(getUserCheck));
router.route('/user/signout').post(checkSession, wrapAsync(postUserSignOut));
router.route('/user/signup').post(checkReCaptcha, wrapAsync(postUserSignUp));
router.route('/user/signin').post(checkReCaptcha, wrapAsync(postUserSignIn));

module.exports = router;
