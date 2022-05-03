require('dotenv').config();
const { GOOGLE_RECAPTCHA_SECRET } = process.env;
const { errRes, arrayObjValue } = require('../../util/util');
const { checkEmailExist, insertNewUser, selectHashedPassword, selectUserData, updateCatClicked, updateLikedCount, updateLinkCounts, updateMissionCompleted } = require('../model/user_model');
const argon2 = require('argon2');
const axios = require('axios');
const { getAllRssUrl } = require('../model/rss_model');
const cache = require('../../util/cache');

const SESSION_EXPIRE_TIME = 3600000 * 24 * 30;

const sessionCheck = async (req, res, next) => {
  let { userId } = req.session.user || { userId: false };
  if (!userId) {
    return next(errRes(404, { status: 2006, msg: 'session error!' }));
  }
  const userData = await cache.get(`user:${userId}`);
  req.body.userData = JSON.parse(userData);
  return next();
};

const reCaptcha = async (req, res, next) => {
  const { reCaptcha = null } = req.body;
  if (reCaptcha) {
    try {
      const reCaptchaResult = await axios({
        method: 'POST',
        url: `https://www.google.com/recaptcha/api/siteverify?secret=${GOOGLE_RECAPTCHA_SECRET}&response=${reCaptcha}`,
      });
      if (!reCaptchaResult.data.success) {
        return next(errRes(404, 'reCaptcha error!'));
      }
      return next();
    } catch (err) {
      return next(errRes(500, 'something wrong about reCaptcha.'));
    }
  }
  return next(errRes(404, 'reCaptcha error!'));
};

const postUserSignUp = async (req, res, next) => {
  const { email = null, password = null, username = null } = req.body;

  // Check if any information is empty.
  if (!email || !password || !username) {
    return next(errRes(404, 'Missing required information.'));
  }

  // Check if email is already been used.
  const emailExistResult = await checkEmailExist(email);
  if (emailExistResult) {
    return next(errRes(409, 'This email has been used.'));
  }
  const hashedPassword = await argon2.hash(password);

  // Insert new user data
  const insertResult = await insertNewUser(email, hashedPassword, username);
  const allRssUrlResult = await getAllRssUrl();
  const defaultDomainList = arrayObjValue(allRssUrlResult);
  if (insertResult) {
    req.session.cookie.expires = new Date(Date.now() + SESSION_EXPIRE_TIME);
    req.session.cookie.maxAge = SESSION_EXPIRE_TIME;
    req.session.user = { userId: insertResult };
    const cacheData = JSON.stringify({
      userId: insertResult,
      provider: 0,
      email: email,
      username: username,
      domain: defaultDomainList,
      likeTags: [],
      dislikeTags: [],
      catStyle: 'original',
      purchased: ['original', 'ghost'],
    });
    cache.set(`user:${insertResult}`, cacheData);
    return res.status(200).json({ data: { status: 2010, msg: 'Signup success.', id: req.sessionID } });
  }
  return next(errRes(500, 'Website is busy, please try again later.'));
};

const getUser = async (req, res) => {
  const { userData } = req.body;
  let selectResult = await selectUserData(userData.userId);
  return res.status(200).json({ data: selectResult });
};

const postUserSignIn = async (req, res, next) => {
  const { provider = null } = req.body;
  if (provider === null || provider === '') {
    return res.status(404).json({ data: 'Provide method is missing.' });
  }
  switch (provider) {
    case 0:
      await nativeSignIn(req, res, next);
      break;
    case 1:
      await googleSignIn(req, res, next);
      break;
    case 2:
      await facebookSignIn(req, res, next);
      break;
    default:
      return res.status(404).json({ data: 'This provider is not supported' });
  }
};

const nativeSignIn = async (req, res, next) => {
  const { provider, email, password } = req.body;

  const emailExistResult = await checkEmailExist(email);
  if (!emailExistResult) {
    return next(errRes(404, 'Email or password is not valid.'));
  }
  const hashData = await selectHashedPassword(provider, email);
  const passwordVerify = await argon2.verify(hashData.password, password);
  if (!passwordVerify) {
    return next(errRes(404, { status: 2000, msg: 'Email or password is not valid.' }));
  }
  req.session.cookie.expires = new Date(Date.now() + SESSION_EXPIRE_TIME);
  req.session.cookie.maxAge = SESSION_EXPIRE_TIME;
  req.session.user = { userId: hashData.id };

  return res.status(200).json({ data: { status: 2000, username: hashData.username } });
};

const facebookSignIn = async (req) => {};
const googleSignIn = async (req) => {};

module.exports = { reCaptcha, sessionCheck, postUserSignUp, postUserSignIn, getUser };
