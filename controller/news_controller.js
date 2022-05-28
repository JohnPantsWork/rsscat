const newsService = require('../service/news_service');

// TODO: 獲得最新新聞，如果有登入，根據設定的來源篩選。
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

// TODO: 根據使用者習慣回傳相關的新聞
const getUserNews = async (req, res) => {
    const { paging } = req.query;
    const { userData } = req.body;
    const newsResult = await newsService.getFeedNews(paging, userData.likeTags);
    const newsWithLiked = await newsService.markLikedNewsDomains(userData.userId, newsResult);
    return res.status(200).json({ data: newsWithLiked });
};

// service functions

module.exports = { getNews, getUserNews };
