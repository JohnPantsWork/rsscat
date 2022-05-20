// internal functions
const { arrayObjValue } = require('../../util/util');
const { rssParser } = require('../../util/rssParser');
const cache = require('../../util/cache');

// services
const { getRssLiked, rssUrlCheckSafe, rssFrequenceLevel } = require('../service/rss_service');

// models
const {
    getLatestRss,
    seleteFeedRss,
    getLatestRssWithDomain,
    getAllRssUrl,
    seleteRssDomainName,
    rssUrlDuplicate,
    insertNewRss,
} = require('../model/rss_model');

const getExploreRss = async (req, res) => {
    const { paging } = req.query;
    const { userData } = req.body;
    let rssResult;
    if (userData === undefined) {
        rssResult = await getLatestRss(paging, 10);
        return res.status(200).json({ data: rssResult });
    }
    rssResult = await getLatestRssWithDomain(paging, 10, userData.domain);
    const rssWithLiked = await getRssLiked(userData.userId, rssResult);

    return res.status(200).json({ data: rssWithLiked });
};

const getFeedRss = async (req, res) => {
    const { paging } = req.query;
    const { userData } = req.body;

    const rssResult = await seleteFeedRss(paging, 10, userData.likeTags, userData.domain);
    const rssWithLiked = await getRssLiked(userData.userId, rssResult);

    return res.status(200).json({ data: rssWithLiked });
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
        return res.status(200).json({ data: { status: 1001, msg: 'This rss url is registered.' } });
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
        return res
            .status(200)
            .json({ data: { msg: 'This url is valid, but it doesnt have any article.' } });
    }
    const rssFrequence = rssFrequenceLevel(rssData.items);
    const insertResult = await insertNewRss(rssData.title, rssFrequence, url);
    if (!insertResult) {
        return res.status(500).json({ data: { msg: `Server is busy, please try again later.` } });
    }

    return res.status(200).json({
        data: {
            msg: `This url is valid , rss source name is "${rssData.title}", ${rssData.items.length} items detected.`,
        },
    });
};

// service functions

module.exports = {
    getExploreRss,
    getFeedRss,
    getLikedRssDomain,
    patchLikedRssDomain,
    deleteLikedRssDomain,
    getAllRssDomain,
    postNewRss,
};
