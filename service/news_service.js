// internal function
const { arrayObjValue } = require('../../util/util');

// models
const { selectLikedNews } = require('../model/news_model');

const getNewsLiked = async (userId, newsArray) => {
    const newsIds = newsArray.map((r) => r.id);
    const likedIdsResult = await selectLikedNews(userId, newsIds);
    const likedIds = arrayObjValue(likedIdsResult);

    const newsWithLiked = newsArray.map((news) => {
        if (likedIds.includes(news.id)) {
            newsArray['liked'] = true;
        } else {
            newsArray['liked'] = false;
        }
        return news;
    });
    return newsWithLiked;
};

module.exports = { getNewsLiked };
