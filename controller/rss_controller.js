const internalMessages = require('../data/internalMessages');
const rssService = require('../service/rss_service');

const getRss = async (req, res) => {
    const { paging } = req.query;
    const { userData } = req.body;
    let rssResult = await rssService.getLatestRss(paging);
    if (userData === undefined) {
        return res.status(200).json({ data: rssResult });
    }
    rssResult = await rssService.getLatestRssWithDomain(paging, userData.domain);
    const rssWithLiked = await rssService.markLikedRssDomains(userData.userId, rssResult);
    return res.status(200).json({ data: rssWithLiked });
};

const getUserRss = async (req, res) => {
    const { paging } = req.query;
    const { userData } = req.body;
    const rssResult = await rssService.getFeedRss(paging, userData.likeTags, userData.domain);
    const rssWithLiked = await rssService.markLikedRssDomains(userData.userId, rssResult);
    return res.status(200).json({ data: rssWithLiked });
};

const getRssDomain = async (req, res) => {
    const allDomain = await rssService.getAllRssUrl();
    const allDomainNames = await rssService.getRssDomainName(allDomain);
    return res.status(200).json({ data: allDomainNames });
};

const postRssDomain = async (req, res) => {
    const { url } = req.body;
    await rssService.checkRssUrlExist(url);
    await rssService.checkRssUrlSafety(url);
    const rssData = await rssService.checkRssUrlValid(url);
    const rssFrequence = rssService.getRssFrequenceLevel(rssData.items);
    await rssService.postNewRss(rssData.title, rssFrequence, url);
    return res.status(200).json({
        data: {
            message: internalMessages[2501],
            sourceName: rssData.title,
        },
    });
};

const getUserDomain = async (req, res) => {
    const { userData } = req.body;
    return res.status(200).json({ data: userData.domain });
};

const patchUserDomain = async (req, res) => {
    const { likedDomainId = null, dislikedDomainId = null, userData } = req.body;

    if (likedDomainId) {
        await rssService.patchLikedDomains(likedDomainId, userData);
    }
    if (dislikedDomainId) {
        await rssService.deleteLikedDomains(dislikedDomainId, userData);
    }

    return res.status(200).json({ data: userData.domain });
};

const putUserDomain = async (req, res) => {
    const { userData, sumbitAll = null } = req.body;
    if (sumbitAll === false) {
        userData.domain = [];
    } else {
        userData.domain = await rssService.getAllDomains();
    }
    await rssService.putDomains(userData);
    return res.status(200).json({ data: userData.domain });
};

module.exports = {
    getRss,
    getUserRss,
    getRssDomain,
    getUserDomain,
    postRssDomain,
    putUserDomain,
    patchUserDomain,
};
