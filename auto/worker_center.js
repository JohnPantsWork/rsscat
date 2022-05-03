require('dotenv').config();
const { MISSION_LIST, MISSION_AMOUNT, MISSION_FREQUENCE_SEC } = process.env;
const cache = require('../util/cache');
const { pool } = require('../util/rdb');

const intervalTime = MISSION_FREQUENCE_SEC * 1000;
setInterval(center, intervalTime);
center(); // use corntab to invoke the mission

const missionList = [
  { mission: 'm_checkRssUpdate', level: 0 },
  { mission: 'm_checkRssUpdate', level: 1 },
  { mission: 'm_checkRssUpdate', level: 2 },
  { mission: 'm_checkRssUpdate', level: 3 },
  { mission: 'm_checkRssUpdate', level: 2 },
  { mission: 'm_checkRssUpdate', level: 3 },
  { mission: 'm_checkNewsApiUpdate' },
];

async function center() {
  const { latest_mission, latest_rss_checked_array } = await centerStatus();
  // a special array contain 6 number which represent the 6 level of latest checked rss id.
  const rss_checked_array = JSON.parse(latest_rss_checked_array);
  // check if latest_mission reaches the missionList's length.
  const newMissionId = latest_mission >= missionList.length - 1 ? 0 : latest_mission + 1;
  console.log(`#--------------------[newMissionId]#\n`, newMissionId);
  const newM = missionList[newMissionId];
  console.log(`#--------------------[newM]#\n`, newM);
  switch (newM.mission) {
    case 'm_checkRssUpdate':
      console.log(`#m_checkRssUpdate#`);
      await m_checkRssUpdate(rss_checked_array[newM.level], parseInt(MISSION_AMOUNT), newM.level);
      break;

    case 'm_checkNewsApiUpdate':
      console.log(`#m_checkNewsApiUpdate#`);
      await m_checkNewsApiUpdate();
      break;

    case 'm_checkGoogleApiUpdate':
      await m_checkGoogleApiUpdate();
      break;

    default:
      break;
  }
  await updateCenterStatus(newMissionId, rss_checked_array);
  // process.exit(); // if manage by corntab.
}

// functions

async function centerStatus() {
  const [status] = await pool.query('SELECT * FROM worker_center WHERE id = 1');
  return status[0];
}

async function updateCenterStatus(latest_mission) {
  const [rowsCount] = await pool.query('SELECT id FROM rss_endpoint ORDER BY id DESC LIMIT 1');
  await pool.query('UPDATE worker_center SET latest_mission=?', [latest_mission]);
}

async function m_checkRssUpdate(latest_id, amount, level) {
  const data = {
    mission: 'checkRssUpdate',
    latest_id: latest_id,
    amount: amount,
    level: level,
  };
  await cache.lpush(MISSION_LIST, JSON.stringify(data));
}

async function m_checkNewsApiUpdate() {
  const data = {
    mission: 'checkNewsApiUpdate',
  };
  await cache.lpush(MISSION_LIST, JSON.stringify(data));
}

async function m_checkGoogleApiUpdate() {
  const data = {
    mission: 'checkGoogleApiUpdate',
  };
  await cache.lpush(MISSION_LIST, JSON.stringify(data));
}
