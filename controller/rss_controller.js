const internalMessages = require('../data/internalMessages');
const rssService = require('../service/rss_service');

// TODO: 獲得最新RSS，如果有登入，根據設定的來源篩選。
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

// TODO: 根據使用者習慣回傳相關的RSS
const getUserRss = async (req, res) => {
    const { paging } = req.query;
    const { userData } = req.body;
    const rssResult = await rssService.selectFeedRss(paging, userData.likeTags, userData.domain);
    const rssWithLiked = await rssService.markLikedRssDomains(userData.userId, rssResult);
    return res.status(200).json({ data: rssWithLiked });
};

// TODO: 回傳所有RSS來源
const getRssDomain = async (req, res) => {
    const allDomain = await rssService.getAllRssUrl();
    const allDomainNames = await rssService.seleteRssDomainName(allDomain);
    return res.status(200).json({ data: allDomainNames });
};

// TODO: 更新使用者上傳的新RSS來源
const postRssDomain = async (req, res) => {
    const { url } = req.body;
    await rssService.checkRssUrlExist(url);
    await rssService.rssUrlCheckSafe(url);
    const rssData = await rssService.checkRssUrlValid(url);
    const rssFrequence = rssService.calculateRssFrequenceLevel(rssData.items);
    await rssService.insertNewRss(rssData.title, rssFrequence, url);
    return res.status(200).json({
        data: {
            message: internalMessages[2501],
            sourceName: rssData.title,
        },
    });
};

// TODO: 回傳使用者喜歡的RSS來源
const getUserDomain = async (req, res) => {
    const { userData } = req.body;
    return res.status(200).json({ data: userData.domain });
};

// TODO: 新增或刪除使用者喜歡的RSS來源
const patchUserDomain = async (req, res) => {
    const { likedDomainId = null, dislikedDomainId = null, userData } = req.body;

    if (likedDomainId) {
        await rssService.addLikedDomains(likedDomainId, userData);
    }
    if (dislikedDomainId) {
        await rssService.removeLikedDomains(dislikedDomainId, userData);
    }

    return res.status(200).json({ data: userData.domain });
};

// TODO: 更新使用者喜歡的RSS來源
const putUserDomain = async (req, res) => {
    const { userData, sumbitAll = null } = req.body;
    if (sumbitAll === false) {
        userData.domain = [];
    } else {
        userData.domain = await rssService.getAllDomains();
    }
    await rssService.setDomains(userData);
    return res.status(200).json({ data: userData.domain });
};

module.exports = {
    getRss,
    getUserRss,
    getRssDomain,
    postRssDomain,
    getUserDomain,
    putUserDomain,
    patchUserDomain,
};
