require('dotenv').config();
const { GOOGLE_RECAPTCHA_SECRET } = process.env;
const { arrayObjValue } = require('../util/utils');
const internalMessages = require('../data/internalMessages');
const cache = require('../util/cache');
const ajax = require('../util/ajax');
const crypt = require('../util/crypt');
const errorHandler = require('../util/errorHandler');
const userValidater = require('../util/validater');
const { getAllRssUrlModel } = require('../model/rss_model');
const { selectStoreItemModel } = require('../model/cat_model');
const {
    selectUserDataModel,
    checkUserExistModel,
    insertNewOauthUserModel,
    insertNewUserModel,
    selectHashedPasswordModel,
    updateLoginDateModel,
    selectUserLoginDateModel,
    selectCoinsModel,
    updateCoinsModel,
} = require('../model/user_model');
const { wrapModel } = require('../util/modelWrappers');

const SESSION_EXPIRE_TIME = 3600000 * 24 * 30;
const NATIVE_TYPE_INDEX = 0;

const userService = {
    checkSession: async function (session) {
        let { userId } = session.user || { userId: false };
        if (!userId) {
            throw new errorHandler(401, 4201);
        }
        return await this.getUserCacheData(userId);
    },
    checkSessionNotStrict: async function (session) {
        let { userId } = session.user || { userId: false };
        if (userId) {
            return await this.getUserCacheData(userId);
        }
    },
    getUserCacheData: async function (userId) {
        const userData = await cache.get(`user:${userId}`);
        return JSON.parse(userData);
    },
    getUserData: async function (userId) {
        return await wrapModel(selectUserDataModel, [userId]);
    },
    postSignUpValidater: async function (username, email, password) {
        await userValidater(username, email, password);
    },
    checkUserEmailExist: async function (email) {
        const emailExistResult = await wrapModel(checkUserExistModel, [NATIVE_TYPE_INDEX, email]);
        if (emailExistResult !== false) {
            throw new errorHandler(409, 4105);
        }
    },
    postNewUser: async function (email, password, username) {
        const hashedPassword = await crypt.hash(password);
        return await wrapModel(insertNewUserModel, [email, hashedPassword, username]);
    },
    checkSigninMethod: async function (provider) {
        if (provider === null || provider === '') {
            throw new errorHandler(404, 4203);
        }
    },
    postSignIn: async function (provider, email, password, username, accessToken) {
        switch (provider) {
            case 0:
                await this.nativeSignIn(provider, email, password, username);
                break;
            case 1:
                await this.googleSignIn(accessToken);
                break;
            case 2:
                await this.facebookSignIn(accessToken);
                break;
            default:
                throw new errorHandler(404, 4204);
        }
    },
    nativeSignIn: async function (provider, email, password, username) {
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
            await this.newUserCacheSetup(hashData.id, email, username);
        }
        await wrapModel(updateLoginDateModel, [hashData.id]);
        return hashData.id;
    },

    facebookSignIn: async function (accessToken) {
        let result = await this.facebookVerify(accessToken);
        const email = result.data.email;
        const username = result.data.name;
        const existId = await wrapModel(checkUserExistModel, [1, email]);
        if (existId === false) {
            const insertId = await wrapModel(insertNewOauthUserModel, [1, email, username]);
            await this.newUserCacheSetup(insertId, email, username);
            return insertId;
        }
        if ((await cache.get(`user:${existId}`)) === null) {
            await this.newUserCacheSetup(existId, email, username);
        }
        await wrapModel(updateLoginDateModel, [existId]);
        return existId;
    },

    googleSignIn: async function (accessToken) {
        let result = await this.googleVerify(accessToken);
        const email = result.data.email;
        const username = result.data.name;
        const existId = await wrapModel(checkUserExistModel, [2, email]);
        if (!existId) {
            const insertId = await wrapModel(insertNewOauthUserModel, [2, email, username]);
            await this.newUserCacheSetup(insertId, email, username);
            return insertId;
        }
        if ((await cache.get(`user:${existId}`)) === null) {
            await this.newUserCacheSetup(existId, email, username);
        }
        await wrapModel(updateLoginDateModel, [existId]);
        return existId;
    },

    reCaptchaVerify: async function (token, provider) {
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

    facebookVerify: async function (accessToken) {
        try {
            return await ajax.params({
                method: 'GET',
                url: `https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`,
            });
        } catch (err) {
            throw new errorHandler(401, 4301);
        }
    },

    googleVerify: async function (accessToken) {
        try {
            return await ajax.params({
                method: 'GET',
                url: `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${accessToken}`,
            });
        } catch (err) {
            throw new errorHandler(401, 4301);
        }
    },

    newUserCacheSetup: async function (id, email, username) {
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

    sessionSetup: async function (session, userId) {
        session.cookie.expires = new Date(Date.now() + SESSION_EXPIRE_TIME);
        session.cookie.maxAge = SESSION_EXPIRE_TIME;
        session.user = { userId: userId };
    },
    selectUserLoginDate: async function (userId) {
        return await wrapModel(selectUserLoginDateModel, [userId]);
    },
    checkCoins: async function (userId) {
        return await selectCoinsModel(userId);
    },
    checkAffordThisPurchase: async function (userId, purchased) {
        const storeItemResult = await wrapModel(selectStoreItemModel, [purchased]);
        const coinsResult = await wrapModel(selectCoinsModel, [userId]);
        if (coinsResult < storeItemResult.price) {
            throw new errorHandler(200, 4401);
        }
        return storeItemResult;
    },
    purchaseItems: async function (userData, storeItemResult) {
        await wrapModel(updateCoinsModel, [-1 * storeItemResult.price, userData.userId]);
        userData['purchased'].push(storeItemResult.title);
        cache.set(`user:${userData.userId}`, JSON.stringify(userData));
    },
    updateUserCoins: async function (reword, userId) {
        await wrapModel(updateCoinsModel, [reword, userId]);
    },
};

module.exports = userService;
