const router = require('express').Router();

const { wrapAsync } = require('../../util/util');
const { reCaptcha, postUserSignUp, postUserSignIn } = require('../controller/user_controller');

router.route('/user/signUp').post(/*reCaptcha,*/ wrapAsync(postUserSignUp));
router.route('/user/signIn').post(/*reCaptcha,*/ wrapAsync(postUserSignIn));

module.exports = router;
