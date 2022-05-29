require('dotenv').config();
const queue = require('./util/queue');
const crawlerController = require('./controller/crawler_controller');

let intervalGate = true;
setInterval(() => {
    if (intervalGate) {
        intervalGate = false;
        checkMission();
    }
}, 1000);

async function checkMission() {
    const nextMission = await queue.get();
    if (nextMission === undefined || nextMission === null) {
        return null;
    }
    const newMission = await JSON.parse(nextMission[1]);
    switch (newMission.mission) {
        case 'checkRssUpdate':
            await crawlerController.checkRssUpdate(newMission);
            break;
        case 'checkNewsApiUpdate':
            await crawlerController.checkNewsApiUpdate();
            break;
        default:
            break;
    }
    console.info(`#mission finish#`);
    intervalGate = true;
}
