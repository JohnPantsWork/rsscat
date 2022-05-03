require('dotenv').config();
const {} = process.env;
const cache = require('../../util/cache');
const { getNow } = require('../../util/util');
const { inserMultiRecord, selectTagNames, selectUserRecord } = require('../model/tag_model');

const postTags = async (req, res) => {
  const { method, likeTags, /*dislikeTags,*/ userData } = req.body;
  let likedTagNamesResult;
  console.log(`#likeTags#`, likeTags);
  // let dislikedTagNamesResult;
  if (method === 'add') {
    // add like tag
    const temp = likeTags.concat(userData.likeTags);
    const newLikeTags = [...new Set(temp)];
    userData.likeTags = newLikeTags;
    likedTagNamesResult = await selectTagNames(userData.likeTags);

    // add dislike tag
    // const temp2 = dislikeTags.concat(userData.dislikeTags);
    // const newDislikeTags = [...new Set(temp2)];
    // userData.dislikeTags = newDislikeTags;
    // dislikedTagNamesResult = await selectTagNames(userData.dislikeTags);
  } else if (method === 'remove') {
    // remove like tag
    const temp = userData.likeTags.filter((tag) => {
      return likeTags.indexOf(tag) === -1;
    });
    userData.likeTags = temp;
    likedTagNamesResult = await selectTagNames(temp);

    // remove dislike tag
    // const temp2 = userData.dislikeTags.filter((tag) => {
    //   return dislikeTags.indexOf(tag) === -1;
    // });
    // userData.dislikeTags = temp2;
    // dislikedTagNamesResult = await selectTagNames(temp2);
  }

  if (!likedTagNamesResult) {
    likedTagNamesResult = [];
  }
  // if (!dislikedTagNamesResult) {
  //   dislikedTagNamesResult = [];
  // }

  await cache.set(`user:${userData.userId}`, JSON.stringify(userData));
  return res.status(200).json({ data: { likeTags: likedTagNamesResult /*, dislikeTags: dislikedTagNamesResult*/ } });
};

const getTags = async (req, res) => {
  const { userData } = req.body;
  let likedTagNamesResult = await selectTagNames(userData.likeTags);
  let dislikedTagNamesResult = await selectTagNames(userData.dislikeTags);
  if (!likedTagNamesResult) {
    likedTagNamesResult = [];
  }
  if (!dislikedTagNamesResult) {
    dislikedTagNamesResult = [];
  }
  return res.status(200).json({ data: { likeTags: likedTagNamesResult, dislikeTags: dislikedTagNamesResult } });
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

module.exports = { postTags, getTags, postRecord, getRecord };
