require('dotenv').config();
const {} = process.env;
const cache = require('../../util/cache');
const { getNow } = require('../../util/util');
const { inserRecord, selectTagNames } = require('../model/tag_model');

const postTags = async (req, res) => {
  const { method, likeTags, dislikeTags, userData } = req.body;
  let likedTagNamesResult;
  let dislikedTagNamesResult;
  if (method === 'add') {
    // add like tag
    const temp = likeTags.concat(userData.likeTags);
    const newLikeTags = [...new Set(temp)];
    userData.likeTags = newLikeTags;
    likedTagNamesResult = await selectTagNames(userData.likeTags);

    // add dislike tag
    const temp2 = dislikeTags.concat(userData.dislikeTags);
    const newDislikeTags = [...new Set(temp2)];
    userData.dislikeTags = newDislikeTags;
    dislikedTagNamesResult = await selectTagNames(userData.dislikeTags);
  } else if (method === 'remove') {
    // remove like tag
    const temp = userData.likeTags.filter((tag) => {
      return likeTags.indexOf(tag) === -1;
    });
    userData.likeTags = temp;
    likedTagNamesResult = await selectTagNames(temp);

    // remove dislike tag
    const temp2 = userData.dislikeTags.filter((tag) => {
      return dislikeTags.indexOf(tag) === -1;
    });
    userData.dislikeTags = temp2;
    dislikedTagNamesResult = await selectTagNames(temp2);
  }

  if (!likedTagNamesResult) {
    likedTagNamesResult = [];
  }
  if (!dislikedTagNamesResult) {
    dislikedTagNamesResult = [];
  }

  await cache.set(`user:${userData.userId}`, JSON.stringify(userData));
  return res.status(200).json({ data: { likeTags: likedTagNamesResult, dislikeTags: dislikedTagNamesResult } });
};

const postRecord = async (req, res) => {
  const today = getNow().date;
  const { record, userData } = req.body;
  await inserRecord(userData.userId, record.tagId, record.id, record.type, today);
  return res.status(200).json({ data: { msg: 'Record success' } });
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

module.exports = { postTags, getTags, postRecord };
