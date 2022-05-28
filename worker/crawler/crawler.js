require('dotenv').config();
setInterval(checkMission, 30000);

const queue = require('./util/queue');
const crawlerController = require('./controller/crawler_controller');

setInterval(checkMission, 3000);

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
}
