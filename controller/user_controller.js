const internalMessages = require('../data/internalMessages');
const userService = require('../service/user_service');

// TODO: 硬檢查session是否過期，若過期則回傳失效。
const checkSession = async (req, res, next) => {
    try {
        req.body.userData = await userService.checkSession(req.session);
    } catch (err) {
        next(err);
    }
    return next();
};

// TODO: 軟檢查session是否過期，若過期依然可以繼續，但後續服務將提供非會員資訊。
const checkSessionNotStrict = async (req, res, next) => {
    req.body.userData = await userService.checkSessionNotStrict(req.session);
    return next();
};

// TODO: 檢查reCaptcha是否正確
const checkReCaptcha = async (req, res, next) => {
    const { reCaptcha, provider } = req.body;
    try {
        await userService.reCaptchaVerify(reCaptcha, provider);
    } catch (err) {
        return next(err);
    }
    return next();
};

// TODO: 獲取整包使用者資料
const getUser = async (req, res) => {
    const { userData } = req.body;
    const result = await userService.getUserData(userData.userId);
    return res.status(200).json({ data: result });
};

// TODO: 立刻回應使用者，作為純session檢查的路由
const getUserCheck = async (req, res) => {
    return res.status(200).json({ data: { message: internalMessages[2201] } });
};

// TODO: 使用者登出
const postUserSignOut = async (req, res) => {
    await req.session.destroy();
    return res.status(200).json({ data: { message: internalMessages[2203] } });
};

// TODO: 原生註冊
const postUserSignUp = async (req, res) => {
    const { email = null, password = null, username = null } = req.body;
    await userService.postSignUpValidater(username, email, password);
    await userService.checkUserEmailExist(email);
    const insertResult = await userService.postNewUser(email, password, username);
    await userService.sessionSetup(req, insertResult);
    await userService.newUserCacheSetup(insertResult, email, username);
    return res.status(200).json({ data: { message: internalMessages[2101], id: req.sessionID } });
};

// TODO: 使用者登入
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
