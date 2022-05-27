const { arrayObjValue } = require('../util/utils');
const errorHandler = require('../util/errorHandler');
const {
    selectNewsModel,
    selectNewsByTagsModel,
    filterLikedNewsModel,
} = require('../model/news_model');
const { wrapModel } = require('../util/modelWrappers');
const NEWS_AMOUNT_PER_PAGE = 10;

const newsService = {
    getLatestNews: async function (paging) {
        return await wrapModel(selectNewsModel, [paging, NEWS_AMOUNT_PER_PAGE]);
    },
    markLikedNewsDomains: async function (userId, newsArray) {
        const newsIds = newsArray.map((r) => r.id);
        const likedIdsResult = await wrapModel(filterLikedNewsModel, [userId, newsIds]);
        const likedIds = arrayObjValue(likedIdsResult);
        const newsWithLiked = newsArray.map((news) => {
            if (likedIds.includes(news.id)) {
                news['liked'] = true;
            } else {
                news['liked'] = false;
            }
            return news;
        });
        return newsWithLiked;
    },
    getFeedNews: async function (paging, likeTags) {
        if (likeTags.length === 0) {
            throw new errorHandler(400, 4504);
        }
        const result = await wrapModel(selectNewsByTagsModel, [
            paging,
            NEWS_AMOUNT_PER_PAGE,
            likeTags,
        ]);
        if (result.length === 0) {
            throw new errorHandler(400, 4504);
        }
        return result;
    },
};

module.exports = newsService;
