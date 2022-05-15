require('dotenv').config();
const { GOOGLE_SAFE_BROWSING_END, GOOGLE_SAFE_BROWSING_KEY } = process.env;
const { arrayObjValue, arrayDiff, rssDateFormatter } = require('../../util/util');
const { getLatestRss, seleteFeedRss, getLatestRssWithDomain, getAllRssUrl, seleteRssDomainName, rssUrlDuplicate, insertNewRss, selectLikedRss, selectRssByTitle } = require('../model/rss_model');
const cache = require('../../util/cache');
const axios = require('axios');
const { rssParser } = require('../../util/rssParser');

const A_DAY_LONG = 24 * 60 * 60 * 1000;
const MAX_RSS_LEVEL_CHECK = 4;

const getExploreRss = async (req, res) => {
    const { paging } = req.query;
    const { userData } = req.body;
    let rssResult;
    if (userData === undefined) {
        rssResult = await getLatestRss(paging, 10);
        return res.status(200).json({ data: rssResult });
    }
    console.log(`#rssResult#`, rssResult);
    rssResult = await getLatestRssWithDomain(paging, 10, userData.domain);

    const rssIds = rssResult.map((r) => r.id);
    const likedResult = await selectLikedRss(userData.userId, rssIds);
    const likedIds = arrayObjValue(likedResult);
    const sendData = rssResult.map((rss) => {
        if (likedIds.includes(rss.id)) {
            rss['liked'] = true;
        } else {
            rss['liked'] = false;
        }
        return rss;
    });
    return res.status(200).json({ data: sendData });
};

const getFeedRss = async (req, res) => {
    const { paging } = req.query;
    const { userData } = req.body;
    const rssResult = await seleteFeedRss(paging, 10, userData.likeTags, userData.domain);
    if (rssResult === false) {
        return res.status(200).json({ data: 'no data' });
    }
    const rssIds = rssResult.map((r) => r.id);
    const likedResult = await selectLikedRss(userData.userId, rssIds);
    const likedIds = arrayObjValue(likedResult);

    const sendData = rssResult.map((rss) => {
        if (likedIds.includes(rss.id)) {
            rss.liked = true;
        } else {
            rss.liked = false;
        }
        return rss;
    });
    return res.status(200).json({ data: sendData });
};

const getAllRssDomain = async (req, res) => {
    const allDomainObjs = await getAllRssUrl();
    const allDomain = arrayObjValue(allDomainObjs);
    let allDomainNames = await seleteRssDomainName(allDomain);
    return res.status(200).json({ data: allDomainNames });
};

const getLikedRssDomain = async (req, res) => {
    const { userData } = req.body;
    return res.status(200).json({ data: userData.domain });
};

const patchLikedRssDomain = async (req, res) => {
    const { likedDomainId = null, userData, sumbitAll = null } = req.body;
    let domains = userData.domain;

    if (sumbitAll !== null) {
        if (sumbitAll === true) {
            const allDomainObjs = await getAllRssUrl();
            const allDomain = arrayObjValue(allDomainObjs);
            domains = domains.concat(allDomain);
        } else if (sumbitAll === false) {
            domains = [];
        }
    } else {
        likedDomainId ? domains.push(likedDomainId) : domains.push();
    }

    userData.domain = [...new Set(domains)];
    cache.set(`user:${userData.userId}`, JSON.stringify(userData));

    return res.status(200).json({ data: userData.domain });
};

const deleteLikedRssDomain = async (req, res) => {
    const { dislikedDomainId, userData } = req.body;

    userData.domain = userData.domain.filter((d) => {
        if (d !== dislikedDomainId) {
            return d;
        }
    });
    cache.set(`user:${userData.userId}`, JSON.stringify(userData));

    return res.status(200).json({ data: userData.domain });
};

const postNewRss = async (req, res) => {
    const { url } = req.body;

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

// functions

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
    return level;
};

module.exports = { getExploreRss, getFeedRss, getLikedRssDomain, patchLikedRssDomain, deleteLikedRssDomain, getAllRssDomain, postNewRss };
