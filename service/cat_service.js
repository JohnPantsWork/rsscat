const { arrayShuffle } = require('../util/utils');
const errorHandler = require('../util/errorHandler');
const cache = require('../util/cache');
const { selectStoreModel, selectMissionModel } = require('../model/cat_model');
const { updateMissionCompletedModel } = require('../model/user_model');
const { wrapModel } = require('../util/modelWrappers');
const MISSION_AMOUNT = 3;
const MISSION_DURATION = 3600 * 24;

const catService = {
    checkHasThisStyle: async function (purchasedStyles, targetStyle) {
        if (purchasedStyles.includes(targetStyle) === false) {
            throw new errorHandler(400, 4402);
        }
    },
    patchStyle: async function (userData, catStyle) {
        userData['catStyle'] = catStyle;
        cache.set(`user:${userData.userId}`, JSON.stringify(userData));
    },
    checkValidReword: async function (missions, completeId) {
        for (let i = 0; i < missions.length; i += 1) {
            if (missions[i].id === completeId && missions[i].completed === false) {
                missions[i].completed = true;
                missions[i].reward;
                return { reward: missions[i].reward, missions: missions };
            }
        }

        return { reword: 0, missions };
    },
    getCatStore: async function () {
        const result = await wrapModel(selectStoreModel, ['pink']);
        return result;
    },
    getCurrentMission: async function (userId) {
        const currentMission = await cache.get(`mission:${userId}`);
        if (currentMission) {
            return JSON.parse(currentMission);
        }
        return null;
    },
    checkCurrentMission: async function (userId) {
        const currentMission = await cache.get(`mission:${userId}`);
        if (currentMission) {
            return JSON.parse(currentMission);
        }
        throw new errorHandler(400, 4403);
    },
    postNewMission: async function (userId) {
        const newMissions = await this.randomNewMissions(MISSION_AMOUNT);
        await cache.setex(`mission:${userId}`, MISSION_DURATION, JSON.stringify(newMissions));
        return newMissions;
    },
    randomNewMissions: async function (missionAmount) {
        const storeResult = await wrapModel(selectMissionModel);
        const newMissions = arrayShuffle(storeResult)
            .slice(0, missionAmount)
            .map((m) => {
                m['completed'] = false;
                return m;
            });
        return newMissions;
    },
    getMissionCacheTTL: async function (userId) {
        return await cache.pttl(`mission:${userId}`);
    },
    patchMissionState: async function (userId, missions) {
        await cache.set(`mission:${userId}`, JSON.stringify(missions), 'KEEPTTL');
        await wrapModel(updateMissionCompletedModel, [1, userId]);
    },
};

module.exports = catService;
