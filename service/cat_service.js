const { arrayShuffle } = require('../../util/util');
const { selectMission } = require('../model/cat_model');

const checkValidReword = async (missions, completeId) => {
    for (let i = 0; i < missions.length; i += 1) {
        if (missions[i].id === completeId && missions[i].completed === false) {
            missions[i].completed = true;
            return missions[i].reward;
        }
    }
    return { reword: 0, missions };
};

const randomNewMissions = async (missionAmount) => {
    const storeResult = await selectMission();
    const newMissions = arrayShuffle(storeResult)
        .slice(0, missionAmount)
        .map((m) => {
            m['completed'] = false;
            return m;
        });
    return newMissions;
};

module.exports = { checkValidReword, randomNewMissions };
