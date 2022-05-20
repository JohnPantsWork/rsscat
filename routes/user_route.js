const router = require('express').Router();

// internal functions
const { wrapAsync } = require('../../util/util');

// controllers
const {
    reCaptcha,
    postUserSignUp,
    postUserSignIn,
    getUser,
    logoutUser,
    checkUser,
} = require('../controller/user_controller');
const { sessionCheck } = require('../controller/user_controller');

// routers
router.route('/user').get(sessionCheck, wrapAsync(getUser));
router.route('/user/signUp').post(wrapAsync(reCaptcha), wrapAsync(postUserSignUp));
router.route('/user/signIn').post(wrapAsync(reCaptcha), wrapAsync(postUserSignIn));
router.route('/user/signOut').post(sessionCheck, wrapAsync(logoutUser));
router.route('/user/check').get(sessionCheck, wrapAsync(checkUser)); // fast route only for session check

module.exports = router;
