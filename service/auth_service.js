require('dotenv').config();
const { GOOGLE_RECAPTCHA_SECRET } = process.env;
const ajax = require('../util/ajax');
const cache = require('../util/cache');
const crypt = require('../util/crypt');
const errorHandler = require('../util/errorHandler');
const internalMessages = require('../data/internalMessages');
const userValidater = require('../util/validater');
const { arrayObjValue } = require('../util/utils');
const { getAllRssUrlModel } = require('../model/rss_model');
const { wrapModel } = require('../util/modelWrappers');
const {
    checkUserExistModel,
    insertNewOauthUserModel,
    insertNewUserModel,
    selectHashedPasswordModel,
    updateLoginDateModel,
    selectUserLoginDateModel,
} = require('../model/user_model');

const SESSION_EXPIRE_TIME = 3600000 * 24 * 30;
const NATIVE_TYPE_INDEX = 0;

const authService = {
    checkSession: async function (session) {
        let { userId } = session.user || { userId: false };
        if (!userId) {
            throw new errorHandler(401, 4201);
        }
        return await this.getUserData(userId);
    },
    checkUserEmailExist: async function (email) {
        const emailExistResult = await wrapModel(checkUserExistModel, [NATIVE_TYPE_INDEX, email]);
        if (emailExistResult !== false) {
            throw new errorHandler(409, 4105);
        }
    },
    checkSessionNotStrict: async function (session) {
        let { userId } = session.user || { userId: false };
        if (userId) {
            return await this.getUserData(userId);
        }
    },
    checkProvider: async function (provider) {
        if (provider === null || provider === '') {
            throw new errorHandler(404, 4203);
        }
    },
    userValidater: async function (username, email, password) {
        await userValidater(username, email, password);
    },

    insertNewUser: async function (email, password, username) {
        const hashedPassword = await crypt.hash(password);
        return await wrapModel(insertNewUserModel, [email, hashedPassword, username]);
    },

    postSignIn: async function (provider, req, res) {
        switch (provider) {
            case 0:
                await this.postNativeSignIn(req, res);
                break;
            case 1:
                await this.postGoogleSignIn(req, res);
                break;
            case 2:
                await this.postFacebookSignIn(req, res);
                break;
            default:
                throw new errorHandler(404, 4204);
        }
    },
    postNativeSignIn: async function (req, res) {
        const { provider, email, password, username } = req.body;
        const emailExistResult = await wrapModel(checkUserExistModel, [0, email]);
        if (!emailExistResult) {
            throw new errorHandler(404, 4202);
        }
        const hashData = await wrapModel(selectHashedPasswordModel, [provider, email]);
        const passwordVerify = await crypt.verify(hashData.password, password);
        if (!passwordVerify) {
            throw new errorHandler(404, 4202);
        }
        if ((await cache.get(`user:${hashData.id}`)) === null) {
            await this.putNewUserCache(hashData.id, email, username);
        }
        await this.sessionSetup(req, hashData.id);
        await wrapModel(updateLoginDateModel, [hashData.id]);

        return res.status(200).json({ data: { statusCode: 2000, username: hashData.username } });
    },

    postFacebookSignIn: async function (req, res) {
        const { accessToken } = req.body;
        let result = await this.getFacebookVerify(accessToken);
        const email = result.data.email;
        const username = result.data.name;
        const existId = await wrapModel(checkUserExistModel, [1, email]);
        if (existId === false) {
            const insertId = await wrapModel(insertNewOauthUserModel, [1, email, username]);
            await this.putNewUserCache(insertId, email, username);
            await this.sessionSetup(req, insertId);
            return res.status(200).json({
                data: { message: internalMessages[2302] },
            });
        }
        // set new user nosql cache data if data is missing.
        if ((await cache.get(`user:${existId}`)) === null) {
            await this.putNewUserCache(existId, email, username);
        }
        await this.sessionSetup(req, existId);
        await wrapModel(updateLoginDateModel, [existId]);

        return res.status(200).json({
            data: { message: internalMessages[2302] },
        });
    },
    postGoogleSignIn: async function (req, res) {
        const { accessToken } = req.body;
        let result = await this.getGoogleVerify(accessToken);

        const email = result.data.email;
        const username = result.data.name;

        const existId = await wrapModel(checkUserExistModel, [2, email]);

        if (!existId) {
            const insertId = await wrapModel(insertNewOauthUserModel, [2, email, username]);
            await this.putNewUserCache(insertId, email, username);
            await this.sessionSetup(req, insertId);
            return res.status(200).json({
                data: { message: internalMessages[2302] },
            });
        }

        if ((await cache.get(`user:${existId}`)) === null) {
            await this.putNewUserCache(existId, email, username);
        }

        await this.sessionSetup(req, existId);
        await wrapModel(updateLoginDateModel, [existId]);

        return res.status(200).json({
            data: { message: internalMessages[2302] },
        });
    },

    postReCaptchaVerify: async function (token, provider) {
        if (provider === 1 || provider === 2) {
            return;
        }
        let reCaptchaResult;
        try {
            reCaptchaResult = await ajax.params({
                method: 'POST',
                url: `https://www.google.com/recaptcha/api/siteverify?secret=${GOOGLE_RECAPTCHA_SECRET}&response=${token}`,
            });
            if (reCaptchaResult.data.success === false) {
                throw new errorHandler(401, 4302);
            }
        } catch (err) {
            throw new errorHandler(500, 5000, err.response);
        }
    },

    getFacebookVerify: async function (accessToken) {
        try {
            return await ajax.params({
                method: 'GET',
                url: `https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`,
            });
        } catch (err) {
            throw new errorHandler(401, 4301);
        }
    },

    getGoogleVerify: async function (accessToken) {
        try {
            return await ajax.params({
                method: 'GET',
                url: `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${accessToken}`,
            });
        } catch (err) {
            throw new errorHandler(401, 4301);
        }
    },
    putNewUserCache: async function (id, email, username) {
        const allRssUrlResult = await wrapModel(getAllRssUrlModel);
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
    },
    sessionSetup: async function (req, userId) {
        req.session.cookie.expires = new Date(Date.now() + SESSION_EXPIRE_TIME);
        req.session.cookie.maxAge = SESSION_EXPIRE_TIME;
        req.session.user = { userId: userId };
    },
    getUserLoginDate: async function (userId) {
        return await wrapModel(selectUserLoginDateModel, [userId]);
    },
};

module.exports = authService;
