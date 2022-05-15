const router = require('express').Router();

const { wrapAsync } = require('../../util/util');
const { reCaptcha, postUserSignUp, postUserSignIn, getUser, logoutUser, checkUser } = require('../controller/user_controller');
const { sessionCheck } = require('../controller/user_controller');

router.route('/user/signUp').post(reCaptcha, wrapAsync(postUserSignUp));
router.route('/user/signIn').post(reCaptcha, wrapAsync(postUserSignIn));

router.route('/user').get(sessionCheck, wrapAsync(getUser));
router.route('/user/signOut').post(sessionCheck, wrapAsync(logoutUser));
router.route('/user/check').get(sessionCheck, wrapAsync(checkUser));

module.exports = router;
