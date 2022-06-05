const internalMessages = require('../data/internalMessages');
const userService = require('../service/user_service');

const checkSession = async (req, res, next) => {
    try {
        req.body.userData = await userService.checkSession(req.session);
    } catch (err) {
        next(err);
    }
    return next();
};

const checkSessionNotStrict = async (req, res, next) => {
    req.body.userData = await userService.checkSessionNotStrict(req.session);
    return next();
};

const checkReCaptcha = async (req, res, next) => {
    const { reCaptcha, provider } = req.body;
    try {
        await userService.postReCaptchaVerify(reCaptcha, provider);
    } catch (err) {
        return next(err);
    }
    return next();
};

const getUser = async (req, res) => {
    const { userData } = req.body;
    const result = await userService.getUserData(userData.userId);
    return res.status(200).json({ data: result });
};

const getUserCheck = async (req, res) => {
    return res.status(200).json({ data: { message: internalMessages[2201] } });
};

const postUserSignOut = async (req, res) => {
    await req.session.destroy();
    return res.status(200).json({ data: { message: internalMessages[2203] } });
};

const postUserSignUp = async (req, res) => {
    const { email = null, password = null, username = null } = req.body;
    await userService.postSignUpValidater(username, email, password);
    await userService.checkUserEmailExist(email);
    const insertResult = await userService.postNewUser(email, password, username);
    req.session = await userService.sessionSetup(req.session, insertResult);
    await userService.putNewUserCache(insertResult, email, username);
    return res.status(200).json({ data: { message: internalMessages[2101], id: req.sessionID } });
};

const postUserSignIn = async (req, res) => {
    const { provider = null, email, password, username, accessToken } = req.body;
    await userService.checkSigninMethod(provider);
    const userId = await userService.postSignIn(provider, email, password, username, accessToken);
    req.session = await userService.sessionSetup(req.session, userId);
    if (provider !== 0) {
        return res.status(200).json({ data: { message: internalMessages[2302] } });
    }
    return res.status(200).json({ data: { message: internalMessages[2202] } });
};

module.exports = {
    checkSession,
    checkSessionNotStrict,
    checkReCaptcha,
    getUser,
    postUserSignOut,
    getUserCheck,
    postUserSignUp,
    postUserSignIn,
};
