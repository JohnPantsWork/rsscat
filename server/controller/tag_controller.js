require('dotenv').config();
const {} = process.env;
const cache = require('../../util/cache');
const { getNow, arrayObjValue } = require('../../util/util');
const { inserMultiRecord, selectTagNames, selectUserRecord, deleteUserRecord } = require('../model/tag_model');
const { updateLikedCount, updateMissionCompleted } = require('../model/user_model');

const getTags = async (req, res) => {
  const { userData } = req.body;
  let likedTagNames = await selectTagNames(userData.likeTags);

  const selectResult = await selectUserRecord(userData.userId);
  const values = arrayObjValue(selectResult);

  let dislikeTags = values.filter((tag) => {
    return userData.likeTags.indexOf(tag) === -1;
  });
  let dislikeTagNames = await selectTagNames(dislikeTags);

  return res.status(200).json({ data: { likeTags: likedTagNames, dislikeTags: dislikeTagNames } });
};

const patchTags = async (req, res) => {
  const { likedTags, userData } = req.body;
  const temp = likedTags.concat(userData.likeTags);
  userData.likeTags = [...new Set(temp)];

  await updateLikedCount(1, userData.userId);
  await cache.set(`user:${userData.userId}`, JSON.stringify(userData));

  let likedTagNamesResult = await selectTagNames(userData.likeTags);
  return res.status(200).json({ data: { likeTags: likedTagNamesResult } });
};

const deleteTags = async (req, res) => {
  const { dislikedTags = [], userData } = req.body;
  const { associate = null } = req.query;

  if (associate !== null) {
    const selectResult = await selectUserRecord(userData.userId);
    const values = arrayObjValue(selectResult);
    userData.likeTags = userData.likeTags.filter((tag) => {
      return values.indexOf(tag) !== -1;
    });
  } else {
    userData.likeTags = userData.likeTags.filter((tag) => {
      return dislikedTags.indexOf(tag) === -1;
    });
  }

  await cache.set(`user:${userData.userId}`, JSON.stringify(userData));

  let likedTagNamesResult = await selectTagNames(userData.likeTags);
  return res.status(200).json({ data: { likeTags: likedTagNamesResult } });
};

// beware, tag_id_arr
const postRecord = async (req, res) => {
  const today = getNow().date;
  const { tag_id_arr, data_id, datatype_id, userData } = req.body || null;
  await inserMultiRecord(userData.userId, tag_id_arr, data_id, datatype_id, today);
  return res.status(200).json({ data: { msg: 'Record success' } });
};

const getRecord = async (req, res) => {
  const { userData } = req.body;
  const selectResult = await selectUserRecord(userData.userId);
  return res.status(200).json({ data: selectResult });
};

const deleteRecord = async (req, res) => {
  const { userData, dataId, datatypeId } = req.body;
  const result = await deleteUserRecord(userData.userId, dataId, datatypeId);
  if (!result) {
    return res.status(400).json({ error: 'dislike failure.' });
  }
  return res.status(200).json({ data: 'dislike success.' });
};

module.exports = { patchTags, getTags, deleteTags, postRecord, getRecord, deleteRecord };
