require('dotenv').config();
const { arrayObjValue, arrayDiff } = require('../../util/util');
const { getLatestRss, seleteFeedRss, getAllRssUrl, seleteRssDomainName } = require('../model/rss_model');
const cache = require('../../util/cache');

const getExploreRss = async (req, res) => {
  const { paging } = req.query;
  const result = await getLatestRss(paging, 10);
  return res.status(200).json({ data: result });
};

const getFeedRss = async (req, res) => {
  const { paging } = req.query;
  const { userData } = req.body;
  const result = await seleteFeedRss(paging, 10, userData.likeTags, userData.domain);
  return res.status(200).json({ data: result });
};

const getRssDomainName = async (req, res) => {
  // get liked domains
  const userData = req.body.userData;
  // get other domains
  const allDomainObjs = await getAllRssUrl();
  const allDomain = arrayObjValue(allDomainObjs);
  const dislikedDomain = arrayDiff(allDomain, userData.domain);
  let likedDomainNames = await seleteRssDomainName(userData.domain);
  let dislikedDomainNames = await seleteRssDomainName(dislikedDomain);
  if (!likedDomainNames) {
    likedDomainNames = [];
  }
  if (!dislikedDomainNames) {
    dislikedDomainNames = [];
  }
  return res.status(200).json({ data: { likedDomains: likedDomainNames, dislikedDomains: dislikedDomainNames } });
};

const postLikedRssDomain = async (req, res) => {
  const { newLikedDomains } = req.body;
  const userData = req.body.userData;
  userData.domain = newLikedDomains;
  const adjustedData = JSON.stringify(userData);
  cache.set(`user:${userData.userId}`, adjustedData);
  res.status(200).json({ data: { msg: 'Change ok.' } });
};

module.exports = { getRssDomainName, getExploreRss, getFeedRss, postLikedRssDomain };
