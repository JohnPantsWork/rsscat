require('dotenv').config();
const { GOOGLE_SAFE_BROWSING_END, GOOGLE_SAFE_BROWSING_KEY } = process.env;
const ajax = require('../util/ajax');
const cache = require('../util/cache');
const errorHandler = require('../util/errorHandler');
const { arrayObjValue, rssToJsDateCvt } = require('../util/utils');
const { rssParser } = require('../util/rssParser');
const { wrapModel } = require('../util/modelWrappers');
const {
    getLatestRssModel,
    seleteFeedRssModel,
    selectLikedRssModel,
    getLatestRssWithDomainModel,
    getAllRssUrlModel,
    seleteRssDomainNameModel,
    rssUrlDuplicateModel,
    insertNewRssModel,
} = require('../model/rss_model');
const SAFE_BROWSING_THREAT_TYPES = [
    'THREAT_TYPE_UNSPECIFIED',
    'MALWARE',
    'SOCIAL_ENGINEERING',
    'UNWANTED_SOFTWARE',
    'POTENTIALLY_HARMFUL_APPLICATION',
];
const SAFE_BROWSING_PLATFORM_TYPES = [
    'PLATFORM_TYPE_UNSPECIFIED',
    'WINDOWS',
    'LINUX',
    'ANDROID',
    'OSX',
    'IOS',
    'ANY_PLATFORM',
    'ALL_PLATFORMS',
    'CHROME',
];
const SAFE_BROWSING_THREAT_ENTRY_TYPES = ['THREAT_ENTRY_TYPE_UNSPECIFIED', 'URL', 'EXECUTABLE'];
const SAFE_BROWSING_CLIENT = {
    clientId: 'rsscat',
    clientVersion: '1.0',
};
const A_DAY_LONG = 24 * 60 * 60 * 1000;
const MAX_RSS_LEVEL_CHECK = 4;
const RSS_AMOUNT_PER_PAGE = 10;

const rssService = {
    checkRssUrlExist: async function (url) {
        const checkDuplicate = await wrapModel(rssUrlDuplicateModel, [url]);
        if (checkDuplicate) {
            throw new errorHandler(400, 4501);
        }
    },
    checkRssUrlValid: async function (url) {
        const rssData = await rssParser(url);
        if (!rssData) {
            throw new errorHandler(400, 4503);
        } else if (rssData.items.length === 0) {
            throw new errorHandler(400, 4505);
        }
        return rssData;
    },
    checkRssUrlSafety: async function (url) {
        const checkSafeBrowsingResult = await ajax.params({
            method: 'POST',
            url: `${GOOGLE_SAFE_BROWSING_END}${GOOGLE_SAFE_BROWSING_KEY}`,
            data: {
                client: SAFE_BROWSING_CLIENT,
                threatInfo: {
                    threatTypes: SAFE_BROWSING_THREAT_TYPES,
                    platformTypes: SAFE_BROWSING_PLATFORM_TYPES,
                    threatEntryTypes: SAFE_BROWSING_THREAT_ENTRY_TYPES,
                    threatEntries: [{ url: url }],
                },
            },
        });
        const { matches } = checkSafeBrowsingResult.data || { matches: false };
        if (matches) {
            throw new errorHandler(400, 4502);
        }
    },
    getLatestRss: async function (paging) {
        return await wrapModel(getLatestRssModel, [paging, RSS_AMOUNT_PER_PAGE]);
    },
    markLikedRssDomains: async function (userId, rssArray) {
        const rssIds = rssArray.map((r) => r.id);
        const likedIdsResult = await wrapModel(selectLikedRssModel, [userId, rssIds]);
        const likedIds = arrayObjValue(likedIdsResult);

        const newsWithLiked = rssArray.map((rss) => {
            if (likedIds.includes(rss.id)) {
                rss['liked'] = true;
            } else {
                rss['liked'] = false;
            }
            return rss;
        });
        return newsWithLiked;
    },
    getLatestRssWithDomain: async function (paging, domains) {
        const result = await wrapModel(getLatestRssWithDomainModel, [
            paging,
            RSS_AMOUNT_PER_PAGE,
            domains,
        ]);
        if (result.length === 0) {
            throw new errorHandler(400, 4504);
        }
        return result;
    },
    getAllRssUrl: async function () {
        const result = await wrapModel(getAllRssUrlModel);
        return arrayObjValue(result);
    },
    getRssDomainName: async function (domains) {
        return await wrapModel(seleteRssDomainNameModel, [domains]);
    },
    getFeedRss: async function (paging, likeTags, domains) {
        if (likeTags.length === 0) {
            throw new errorHandler(400, 4504);
        }
        const result = await wrapModel(seleteFeedRssModel, [
            paging,
            RSS_AMOUNT_PER_PAGE,
            likeTags,
            domains,
        ]);
        if (result.length === 0) {
            throw new errorHandler(400, 4504);
        }
        return result;
    },
    getAllDomains: async function () {
        const allDomainObjs = await this.getAllRssUrl();
        return arrayObjValue(allDomainObjs);
    },
    putDomains: async function (userData) {
        await cache.set(`user:${userData.userId}`, JSON.stringify(userData));
    },
    patchLikedDomains: async function (likedDomainId, userData) {
        userData.domain.push(likedDomainId);
        cache.set(`user:${userData.userId}`, JSON.stringify(userData));
    },
    deleteLikedDomains: async function (dislikedDomainId, userData) {
        userData.domain = userData.domain.filter((domain) => {
            if (domain !== dislikedDomainId) {
                return domain;
            }
        });
        await cache.set(`user:${userData.userId}`, JSON.stringify(userData));
    },

    postNewRss: async function (title, frequence, url) {
        await wrapModel(insertNewRssModel, [title, frequence, url]);
    },

    getRssFrequenceLevel: function (items) {
        const dateArr = items.map((item) => {
            return rssToJsDateCvt(item.pubDate);
        });
        const newest = dateArr[0];
        let level = 0;
        for (let i = 1; i < dateArr.length && i < MAX_RSS_LEVEL_CHECK; i += 1) {
            const pre = dateArr[i];
            let gap = (newest - pre) / A_DAY_LONG;
            // 7 means a week.
            if (gap >= 7) {
                break;
            }
            level += 1;
        }
        return level;
    },
};

module.exports = rssService;
