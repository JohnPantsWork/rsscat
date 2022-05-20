// internal functions
const { ErrorMsgAndCode } = require('../../util/util');
const { crypt } = require('../../util/crypt');
const cache = require('../../util/cache');
const { userValidater } = require('../../util/validater');

// services
const {
    reCaptchaVerify,
    facebookVerify,
    googleVerify,
    newUserCacheSetup,
    sessionSetup,
} = require('../service/user_service');

// models
const {
    checkUserExist,
    insertNewUser,
    insertNewOauthUser,
    selectHashedPassword,
    selectUserData,
    updateLoginDate,
} = require('../model/user_model');

// const
const SESSION_EXPIRE_TIME = 3600000 * 24 * 30;

const sessionCheck = async (req, res, next) => {
    let { userId } = req.session.user || { userId: false };
    if (!userId) {
        return next(ErrorMsgAndCode(401, 40100, 'Session check failure.'));
    }

    const userData = await cache.get(`user:${userId}`);
    req.body.userData = JSON.parse(userData);

    return next();
};

// try get user id, still "next()" even userId is not found in session.
const sessionSoftCheck = async (req, res, next) => {
    let { userId } = req.session.user || { userId: false };
    if (userId) {
        const userData = await cache.get(`user:${userId}`);
        req.body.userData = JSON.parse(userData);
    }

    return next();
};

const reCaptcha = async (req, res, next) => {
    const { reCaptcha = null, provider } = req.body;
    // reCaptcha is unnecessary if provider is not 0.
    if (provider === 1 || provider === 2) {
        return next();
    }

    await reCaptchaVerify(reCaptcha);
    return next();
};

const getUser = async (req, res) => {
    const { userData } = req.body;
    let selectResult = await selectUserData(userData.userId);
    return res.status(200).json({ data: selectResult });
};

const checkUser = async (req, res) => {
    return res.status(200).json({ data: { statusCode: 20000, msg: 'session checked' } });
};

const postUserSignUp = async (req, res, next) => {
    const { email = null, password = null, username = null } = req.body;

    try {
        await userValidater(username, email, password);
    } catch (err) {
        return next(ErrorMsgAndCode(400, 40002, 'data is not valid.'));
    }

    // Check if any information is empty.
    if (!email || !password || !username) {
        return next(ErrorMsgAndCode(404, 40000, 'Missing required information.'));
    }

    // Check if email is already been used. 0 = native
    const emailExistResult = await checkUserExist(0, email);
    if (emailExistResult !== false) {
        return next(ErrorMsgAndCode(409, 40010, 'This email has been used.'));
    }
    const hashedPassword = await crypt.hash(password);

    // Insert new user data
    const insertResult = await insertNewUser(email, hashedPassword, username);

    if (!insertResult) {
        return next(ErrorMsgAndCode(500, 0, 'backend: user insert data failure'));
    }

    req.session.cookie.expires = new Date(Date.now() + SESSION_EXPIRE_TIME);
    req.session.cookie.maxAge = SESSION_EXPIRE_TIME;
    req.session.user = { userId: insertResult };
    newUserCacheSetup(insertResult, email, username);
    return res.status(200).json({ data: { msg: 'Signup success.', id: req.sessionID } });
};

const postUserSignIn = async (req, res) => {
    const { provider = null } = req.body;

    if (provider === null || provider === '') {
        throw ErrorMsgAndCode(404, 40103, 'Provider is missing.');
    }

    switch (provider) {
        case 0:
            await nativeSignIn(req, res);
            break;
        case 1:
            await googleSignIn(req, res);
            break;
        case 2:
            await facebookSignIn(req, res);
            break;
        default:
            throw ErrorMsgAndCode(404, 40104, 'This provider is not supported');
    }
};

const logoutUser = async (req, res) => {
    await req.session.destroy();
    return res.status(200).json({ data: 'logout success.' });
};

// service functions

const nativeSignIn = async (req, res) => {
    const { provider, email, password, username } = req.body;

    const emailExistResult = await checkUserExist(0, email);
    if (!emailExistResult) {
        throw ErrorMsgAndCode(404, 40101, 'Email or password is not valid.');
    }

    const hashData = await selectHashedPassword(provider, email);
    const passwordVerify = await crypt.verify(hashData.password, password);
    if (!passwordVerify) {
        throw ErrorMsgAndCode(404, 40101, 'Email or password is not valid.');
    }

    if ((await cache.get(`user:${hashData.id}`)) === null) {
        await newUserCacheSetup(hashData.id, email, username);
    }
    await sessionSetup(req, hashData.id, SESSION_EXPIRE_TIME);
    await updateLoginDate(hashData.id);

    return res.status(200).json({ data: { statusCode: 2000, username: hashData.username } });
};

const facebookSignIn = async (req, res) => {
    const { accessToken } = req.body;
    let result = await facebookVerify(accessToken);

    const email = result.data.email;
    const username = result.data.name;

    const existId = await checkUserExist(1, email);

    if (existId === false) {
        const insertId = await insertNewOauthUser(1, email, username);
        await newUserCacheSetup(insertId, email, username);
        await sessionSetup(req, insertId, SESSION_EXPIRE_TIME);
        return res.status(200).json({
            data: { msg: 'Facebook signup success.', id: req.sessionID },
        });
    }

    // set new user nosql cache data if data is missing.
    if ((await cache.get(`user:${existId}`)) === null) {
        await newUserCacheSetup(existId, email, username);
    }

    await sessionSetup(req, existId, SESSION_EXPIRE_TIME);
    await updateLoginDate(existId);

    return res
        .status(200)
        .json({ data: { statusCode: 20004, msg: 'Facebook signin success.', id: req.sessionID } });
};

const googleSignIn = async (req, res) => {
    const { accessToken } = req.body;
    let result = await googleVerify(accessToken);

    const email = result.data.email;
    const username = result.data.name;

    const existId = await checkUserExist(2, email);

    if (!existId) {
        const insertId = await insertNewOauthUser(2, email, username);
        await newUserCacheSetup(insertId, email, username);
        await sessionSetup(req, insertId, SESSION_EXPIRE_TIME);
        return res.status(200).json({
            data: { statusCode: 20003, msg: 'Google signup success.', id: req.sessionID },
        });
    }

    if ((await cache.get(`user:${existId}`)) === null) {
        await newUserCacheSetup(existId, email, username);
    }

    await sessionSetup(req, existId, SESSION_EXPIRE_TIME);
    await updateLoginDate(existId);

    return res
        .status(200)
        .json({ data: { statusCode: 20004, msg: 'Google signin success.', id: req.sessionID } });
};

module.exports = {
    reCaptcha,
    sessionCheck,
    sessionSoftCheck,
    postUserSignUp,
    postUserSignIn,
    getUser,
    logoutUser,
    checkUser,
};
