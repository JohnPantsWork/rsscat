require('dotenv').config();
const { GOOGLE_SAFE_BROWSING_END, GOOGLE_SAFE_BROWSING_KEY } = process.env;
const { arrayObjValue, arrayDiff, rssDateFormatter } = require('../../util/util');
const { getLatestRss, seleteFeedRss, getAllRssUrl, seleteRssDomainName, rssUrlDuplicate, insertNewRss } = require('../model/rss_model');
const cache = require('../../util/cache');
const axios = require('axios');
const { rssParser } = require('../../util/rssParser');

const A_DAY_LONG = 24 * 60 * 60 * 1000;
const MAX_RSS_LEVEL_CHECK = 4;

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
  return res.status(200).json({ data: { msg: 'Change ok.' } });
};

const postNewRss = async (req, res) => {
  const { url } = req.body;
  console.log(`#url#`, url);

  const checkDuplicate = await rssUrlDuplicate(url);
  if (checkDuplicate) {
    return res.status(200).json({ data: { status: 1001, msg: 'This url is registered.' } });
  }

  const saftyCheck = await rssUrlCheckSafe(url);
  if (!saftyCheck) {
    return res.status(200).json({ data: { status: 1001, msg: 'This url is not safe.' } });
  }

  const rssData = await rssParser(url);
  if (!rssData) {
    return res.status(200).json({ data: { msg: 'This url is not a valid rss url.' } });
  }

  if (rssData.items.length === 0) {
    return res.status(200).json({ data: { msg: 'This url is valid, but it doesnt have any article.' } });
  }
  const rssFrequence = rssFrequenceLevel(rssData.items);
  const insertResult = await insertNewRss(rssData.title, rssFrequence, url);
  if (!insertResult) {
    return res.status(500).json({ data: { msg: `Server is busy, please try again later.` } });
  }

  return res.status(200).json({ data: { msg: `This url is valid , rss source name is "${rssData.title}", ${rssData.items.length} items detected.` } });
};

const rssUrlCheckSafe = async (url) => {
  const checkSafeBrowsingResult = await axios({
    method: 'POST',
    url: `${GOOGLE_SAFE_BROWSING_END}${GOOGLE_SAFE_BROWSING_KEY}`,
    data: {
      client: {
        clientId: 'rsscat',
        clientVersion: '1.0',
      },
      threatInfo: {
        threatTypes: ['THREAT_TYPE_UNSPECIFIED', 'MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
        platformTypes: ['PLATFORM_TYPE_UNSPECIFIED', 'WINDOWS', 'LINUX', 'ANDROID', 'OSX', 'IOS', 'ANY_PLATFORM', 'ALL_PLATFORMS', 'CHROME'],
        threatEntryTypes: ['THREAT_ENTRY_TYPE_UNSPECIFIED', 'URL', 'EXECUTABLE'],
        threatEntries: [{ url: url }],
      },
    },
  });
  const { matches } = checkSafeBrowsingResult.data || { matches: true };
  if (matches) {
    return false;
  }
  return true;
};

const rssFrequenceLevel = (items) => {
  const dateArr = items.map((item) => {
    return rssDateFormatter(item.pubDate);
  });

  const newest = dateArr[0];
  let level = 0;

  for (let i = 1; i < dateArr.length && i < MAX_RSS_LEVEL_CHECK; i += 1) {
    const pre = dateArr[i];

    let gap = (newest - pre) / A_DAY_LONG;

    if (gap >= 7) {
      break;
    }
    level += 1;
  }
  console.log(`level#`, level);
  return level;
};

module.exports = { getRssDomainName, getExploreRss, getFeedRss, postLikedRssDomain, postNewRss };
