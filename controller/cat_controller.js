// internal functions
const { ErrorMsgAndCode } = require('../../util/util');
const { selectCatStore, selectStoreItem } = require('../model/cat_model');
const cache = require('../../util/cache');

// service
const { checkValidReword, randomNewMissions } = require('../service/cat_service');

// models
const {
    selectCoins,
    updateCoins,
    selectUserLoginDate,
    updateMissionCompleted,
} = require('../model/user_model');

// const
const MISSION_AMOUNT = 3;
const MISSION_LENGTH = 3600 * 24;

const getCatState = async (req, res) => {
    const { userData } = req.body;

    // get user's cat last state and last signin date.
    const loginDateResult = await selectUserLoginDate(userData.userId);

    return res.status(200).json({
        data: {
            latest_login: JSON.stringify(loginDateResult),
            latest_style: userData.catStyle,
        },
    });
};

const patchCatState = async (req, res, next) => {
    const { userData, catStyle } = req.body;

    // check if this catStyle is purchased.
    if (userData['purchased'].includes(catStyle) === false) {
        return next(new ErrorMsgAndCode(400, 40006, 'This cat style is not purchased yet.'));
    }

    // change user's cat style setting.
    userData['catStyle'] = catStyle;
    cache.set(`user:${userData.userId}`, JSON.stringify(userData));

    return res.status(200).json({ data: { msg: 'Cat style changed success.' } });
};

const postCatStore = async (req, res) => {
    const { userData, purchased } = req.body;

    // get item price and the user owns money.
    const storeItemResult = await selectStoreItem(purchased);
    const coinsResult = await selectCoins(userData.userId);

    // check money is enough.
    if (coinsResult < storeItemResult.price) {
        return ErrorMsgAndCode(400, 40005, 'Money is not enough.');
    }

    // update user purchased data.
    await updateCoins(-storeItemResult.price, userData.userId);
    userData['purchased'].push(storeItemResult.title);
    cache.set(`user:${userData.userId}`, JSON.stringify(userData));

    return res.status(200).json({ data: { msg: 'purchased success.' } });
};

const getCatStore = async (req, res) => {
    const { userData } = req.body;

    // get cat store info.
    const storeResult = await selectCatStore();

    // get user coins data.
    const coinResult = await selectCoins(userData.userId);

    return res
        .status(200)
        .json({ data: { store: storeResult, purchased: userData.purchased, coins: coinResult } });
};

const getCatMission = async (req, res) => {
    const { userData } = req.body;

    // check mission from cache
    let cacheMissions = await cache.get(`mission:${userData.userId}`);

    // if no mission , create new missions.
    let missionList;
    let missionNeedRenew = false;
    if (cacheMissions === null) {
        // tell frontend to update mission.
        missionNeedRenew = true;
        // create new missions
        missionList = randomNewMissions(MISSION_AMOUNT);
        await cache.setex(
            `mission:${userData.userId}`,
            MISSION_LENGTH,
            JSON.stringify(missionList)
        );
    } else {
        missionList = JSON.parse(cacheMissions);
    }

    //get ttl from mission
    const ttl = await cache.pttl(`mission:${userData.userId}`);

    return res.status(200).json({ data: { missionList, ttl, missionNeedRenew } });
};

const patchCatMission = async (req, res) => {
    const { userData, completedMissionId } = req.body;

    // check if mission is expired.
    let cacheMissions = JSON.parse(await cache.get(`mission:${userData.userId}`));
    if (cacheMissions === null) {
        return res.status(200).json({ data: { msg: 'missions are expired.' } });
    }

    // check if mission is not complete.
    let result = await checkValidReword(cacheMissions, completedMissionId);

    // if reword is valid.
    if (result.reword > 0) {
        // update mission
        await cache.set(`mission:${userData.userId}`, JSON.stringify(result.missions), 'KEEPTTL');
        await updateCoins(result.reword, userData.userId);
    }

    await updateMissionCompleted(1, userData.userId);

    return res.status(200).json({ data: { msg: 'Reward finish.' } });
};

module.exports = {
    getCatState,
    patchCatState,
    postCatStore,
    getCatStore,
    getCatMission,
    patchCatMission,
};
