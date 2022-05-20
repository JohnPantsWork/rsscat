// env
require('dotenv').config();
const { GOOGLE_SAFE_BROWSING_END, GOOGLE_SAFE_BROWSING_KEY } = process.env;

// npm
const axios = require('axios');

// internal functions
const { arrayObjValue, rssToJsDateCvt } = require('../../util/util');

// models
const { selectLikedRss } = require('../model/rss_model');

// const
const A_DAY_LONG = 24 * 60 * 60 * 1000;
const MAX_RSS_LEVEL_CHECK = 4;

const getRssLiked = async (userId, rssArray) => {
    const rssIds = rssArray.map((r) => r.id);
    const likedIdsResult = await selectLikedRss(userId, rssIds);
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
                threatTypes: [
                    'THREAT_TYPE_UNSPECIFIED',
                    'MALWARE',
                    'SOCIAL_ENGINEERING',
                    'UNWANTED_SOFTWARE',
                    'POTENTIALLY_HARMFUL_APPLICATION',
                ],
                platformTypes: [
                    'PLATFORM_TYPE_UNSPECIFIED',
                    'WINDOWS',
                    'LINUX',
                    'ANDROID',
                    'OSX',
                    'IOS',
                    'ANY_PLATFORM',
                    'ALL_PLATFORMS',
                    'CHROME',
                ],
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
        return rssToJsDateCvt(item.pubDate);
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

module.exports = { getRssLiked, rssUrlCheckSafe, rssFrequenceLevel };
