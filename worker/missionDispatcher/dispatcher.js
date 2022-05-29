require('dotenv').config();
const { MISSION_DELAY } = process.env;
const MISSION_PER_DISPATCH = parseInt(process.env.MISSION_PER_DISPATCH);
const cache = require('./util/cache');
const {
    selectRssFrequenceCounts,
    selectCenterStatus,
    updateCenterStatus,
} = require('./model/dispatcher_model');
const missionDelay = MISSION_DELAY * 1000;
const MISSION_LIST = 'missions';

setTimeout(() => {
    dispatcher();
}, missionDelay);

async function dispatcher() {
    updateNewsMission();

    const endpoints = await getNextbundleOfRss();
    console.log(`#endpoints#`, endpoints);
    for (let i = 0; i < endpoints.length; i += 1) {
        updateRssMission(endpoints[i].id, endpoints[i].url);
    }
    console.log(`#mission dispatched#`);
}

async function updateRssMission(id, url) {
    const data = {
        mission: 'checkRssUpdate',
        id,
        url,
    };
    await cache.lpush(MISSION_LIST, JSON.stringify(data));
}

async function updateNewsMission() {
    const data = {
        mission: 'checkNewsApiUpdate',
    };
    await cache.lpush(MISSION_LIST, JSON.stringify(data));
}

async function getFormatRssEndpoints(lastId) {
    const result = await selectRssFrequenceCounts(lastId, MISSION_PER_DISPATCH);
    const missionList = result.map((rss) => {
        return { id: rss.id, url: rss.url };
    });
    return missionList;
}

async function getNextbundleOfRss() {
    const lastRssId = await selectCenterStatus();
    const arrayRssObjs = await getFormatRssEndpoints(lastRssId[0].latest_mission);
    console.log(`##`, arrayRssObjs);

    const latestId =
        arrayRssObjs.length < MISSION_PER_DISPATCH ? 0 : arrayRssObjs[arrayRssObjs.length - 1].id;
    await updateCenterStatus(latestId);

    return arrayRssObjs;
}
