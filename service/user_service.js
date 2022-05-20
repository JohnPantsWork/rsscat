// env
require('dotenv').config();
const { GOOGLE_RECAPTCHA_SECRET } = process.env;

// npm
const axios = require('axios');

// internal functions
const { newErrRes, arrayObjValue } = require('../../util/util');
const cache = require('../../util/cache');

// models
const { getAllRssUrl } = require('../model/rss_model');

const reCaptchaVerify = async (token) => {
    const reCaptchaResult = await axios({
        method: 'POST',
        url: `https://www.google.com/recaptcha/api/siteverify?secret=${GOOGLE_RECAPTCHA_SECRET}&response=${token}`,
    });
    if (!reCaptchaResult.data.success) {
        return newErrRes(404, { statusCode: 40001, msg: 'reCaptcha is not valid.' });
    }
};

const facebookVerify = async (accessToken) => {
    try {
        return await axios({
            method: 'GET',
            url: `https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`,
        });
    } catch (err) {
        throw newErrRes(401, { statusCode: 40102, msg: 'Facebook token is not valid.' });
    }
};

const googleVerify = async (accessToken) => {
    try {
        return await axios({
            method: 'GET',
            url: `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${accessToken}`,
        });
    } catch (err) {
        throw newErrRes(401, { statusCode: 40102, msg: 'Google token is not valid.' });
    }
};

const newUserCacheSetup = async (id, email, username) => {
    const allRssUrlResult = await getAllRssUrl();
    const defaultDomainList = arrayObjValue(allRssUrlResult);
    const cacheData = JSON.stringify({
        userId: id,
        provider: 0,
        email: email,
        username: username,
        domain: defaultDomainList,
        likeTags: [],
        dislikeTags: [],
        catStyle: 'original',
        purchased: ['original', 'ghost'],
    });
    cache.set(`user:${id}`, cacheData);
};

const sessionSetup = async (req, id, expireTime) => {
    req.session.cookie.expires = new Date(Date.now() + expireTime);
    req.session.cookie.maxAge = expireTime;
    req.session.user = { userId: id };
};

module.exports = {
    reCaptchaVerify,
    facebookVerify,
    googleVerify,
    newUserCacheSetup,
    sessionSetup,
};
