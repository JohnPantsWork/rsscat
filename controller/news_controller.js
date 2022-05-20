// services
const { getNewsLiked } = require('../service/news_service');

// models
const { getLatestNews, seleteFeedNews } = require('../model/news_model');

const getExploreNews = async (req, res) => {
    const { paging } = req.query;
    const { userData } = req.body;

    // get latest news
    const newsResult = await getLatestNews(paging, 10);

    // if not signin, send normal explore news.
    if (userData === undefined) {
        return res.status(200).json({ data: newsResult });
    }

    // news marked with liked.
    const newsWithLiked = await getNewsLiked(userData.userId, newsResult);

    return res.status(200).json({ data: newsWithLiked });
};

const getFeedNews = async (req, res) => {
    const { paging } = req.query;
    const { userData } = req.body;

    // get latest feed news
    const newsResult = await seleteFeedNews(paging, 10, userData.likeTags);

    // news marked with liked.
    const newsWithLiked = await getNewsLiked(userData.userId, newsResult);

    return res.status(200).json({ data: newsWithLiked });
};

// service functions

module.exports = { getExploreNews, getFeedNews };
