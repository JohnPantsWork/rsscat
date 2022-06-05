const newsService = require('../service/news_service');

const getNews = async (req, res) => {
    const { paging } = req.query;
    const { userData } = req.body;
    const newsResult = await newsService.getLatestNews(paging);
    if (userData === undefined) {
        return res.status(200).json({ data: newsResult });
    }
    const newsWithLiked = await newsService.markLikedNewsDomains(userData.userId, newsResult);
    return res.status(200).json({ data: newsWithLiked });
};

const getUserNews = async (req, res) => {
    const { paging } = req.query;
    const { userData } = req.body;
    const newsResult = await newsService.getFeedNews(paging, userData.likeTags);
    const newsWithLiked = await newsService.markLikedNewsDomains(userData.userId, newsResult);
    return res.status(200).json({ data: newsWithLiked });
};

// service functions

module.exports = { getNews, getUserNews };
