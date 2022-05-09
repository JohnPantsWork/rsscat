require('dotenv').config();
const { stringDateConverter, shuffle } = require('../../util/util');
const { selectCatStore, selectMission, selectStoreItem } = require('../model/cat_model');
const { selectCoins, updateCoins, selectUserLoginDate, updateMissionCompleted } = require('../model/user_model');
const cache = require('../../util/cache');

const MISSION_AMOUNT = 3;
const MISSION_LENGTH = 3600 * 24;

const getCatState = async (req, res) => {
  const { userData } = req.body;
  const loginDateResult = await selectUserLoginDate(userData.userId);
  // const fake = stringDateConverter('2022-04-29 00:00:00');
  return res.status(200).json({ data: { latest_login: JSON.stringify(loginDateResult), latest_style: userData.catStyle } });
};

const patchCatState = async (req, res) => {
  const { userData, catStyle } = req.body;
  userData['catStyle'] = catStyle;
  cache.set(`user:${userData.userId}`, JSON.stringify(userData));
  return res.status(200).json({ data: { msg: 'cat style changed.' } });
};

const postCatStore = async (req, res) => {
  const { userData, purchased } = req.body;
  const storeItemResult = await selectStoreItem(purchased);
  const coinsResult = await selectCoins(userData.userId);

  if (coinsResult < storeItemResult.price) {
    return res.status(400).json({ data: { msg: 'money is not enough.' } });
  }

  const result = await updateCoins(-storeItemResult.price, userData.userId);
  userData['purchased'].push(storeItemResult.title);
  cache.set(`user:${userData.userId}`, JSON.stringify(userData));

  return res.status(200).json({ data: { msg: 'purchased success.' } });
};

const getCatStore = async (req, res) => {
  const { userData } = req.body;
  const storeResult = await selectCatStore();
  const coinResult = await selectCoins(userData.userId);
  return res.status(200).json({ data: { store: storeResult, purchased: userData.purchased, coins: coinResult } });
};

const getCatMission = async (req, res) => {
  const { userData } = req.body;

  let cacheMissions = await cache.get(`mission:${userData.userId}`);
  let missionList;
  let renew = false;

  if (cacheMissions === null) {
    renew = true;
    const storeResult = await selectMission();
    missionList = shuffle(storeResult).slice(0, MISSION_AMOUNT);
    missionList = missionList.map((m) => {
      m['completed'] = false;
      return m;
    });
    await cache.setex(`mission:${userData.userId}`, MISSION_LENGTH, JSON.stringify(missionList));
  } else {
    missionList = JSON.parse(cacheMissions);
  }
  const ttl = await cache.pttl(`mission:${userData.userId}`);

  return res.status(200).json({ data: { missionList, ttl, renew } });
};

const patchCatMission = async (req, res) => {
  const { userData, completed } = req.body;

  let cacheMissions = await cache.get(`mission:${userData.userId}`);
  if (cacheMissions === null) {
    return res.status(200).json({ data: { msg: 'missions are expired.' } });
  }
  let missionList = JSON.parse(cacheMissions);
  let reward = 0;
  for (let i = 0; i < missionList.length; i += 1) {
    if (missionList[i].id === completed && missionList[i].completed === false) {
      missionList[i].completed = true;
      reward = missionList[i].reward;
      break;
    }
  }
  await cache.set(`mission:${userData.userId}`, JSON.stringify(missionList), 'KEEPTTL');

  if (reward > 0) {
    await updateCoins(reward, userData.userId);
  }

  await updateMissionCompleted(1, userData.userId);

  return res.status(200).json({ data: { msg: 'Reward finish.' } });
};

module.exports = { getCatState, patchCatState, postCatStore, getCatStore, getCatMission, patchCatMission };
