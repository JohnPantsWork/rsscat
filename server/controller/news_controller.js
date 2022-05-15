require('dotenv').config();
const { arrayObjValue } = require('../../util/util');
const { getLatestNews, seleteFeedNews, selectLikedNews, selectNewsByTitle } = require('../model/news_model');

const getExploreNews = async (req, res) => {
    const { paging } = req.query;
    const { userData } = req.body;
    const newsResult = await getLatestNews(paging, 10);

    if (userData === undefined) {
        return res.status(200).json({ data: newsResult });
    }

    const newsIds = newsResult.map((r) => r.id);
    const likedResult = await selectLikedNews(userData.userId, newsIds);
    const likedIds = arrayObjValue(likedResult);
    const sendData = newsResult.map((news) => {
        if (likedIds.includes(news.id)) {
            news['liked'] = true;
        } else {
            news['liked'] = false;
        }
        return news;
    });

    return res.status(200).json({ data: sendData });
};

const getFeedNews = async (req, res) => {
    const { paging } = req.query;
    const { userData } = req.body;
    const newsResult = await seleteFeedNews(paging, 10, userData.likeTags);

    const newsIds = newsResult.map((r) => r.id);
    const likedResult = await selectLikedNews(userData.userId, newsIds);
    const likedIds = arrayObjValue(likedResult);
    const sendData = newsResult.map((news) => {
        if (likedIds.includes(news.id)) {
            news['liked'] = true;
        } else {
            news['liked'] = false;
        }
        return news;
    });

    return res.status(200).json({ data: sendData });
};

const getSearchNews = async (req, res) => {
    const { paging, title } = req.query;
    const newsResult = await seleteFeedNews(paging, 10, userData.likeTags);

    const newsIds = newsResult.map((r) => r.id);
    const likedResult = await selectLikedNews(userData.userId, newsIds);
    const likedIds = arrayObjValue(likedResult);
    const sendData = newsResult.map((news) => {
        if (likedIds.includes(news.id)) {
            news['liked'] = true;
        } else {
            news['liked'] = false;
        }
        return news;
    });

    return res.status(200).json({ data: sendData });
};

module.exports = { getExploreNews, getFeedNews };
