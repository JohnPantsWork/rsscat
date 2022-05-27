require('dotenv').config();
const { MISSION_DELAY } = process.env;
const cache = require('./util/cache');
const { selectRssFrequenceCounts } = require('./model/dispatcher_model');
const missionDelay = MISSION_DELAY * 1000;
const MISSION_LIST = 'missions';

setTimeout(() => {
    dispatcher();
}, missionDelay);

async function dispatcher() {
    updateNewsMission();

    const endpoints = await selectAndFormatRssEndpoints();

    for (let i = 0; i < endpoints.length; i += 1) {
        updateRssMission(endpoints[i].id, endpoints[i].url);
    }
}

async function selectAndFormatRssEndpoints() {
    const result = await selectRssFrequenceCounts();
    const missionList = result.map((rss) => {
        return { id: rss.id, url: rss.url };
    });
    return missionList;
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
