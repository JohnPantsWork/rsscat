require('dotenv').config();
const { getLatestNews, seleteFeedNews } = require('../model/news_model');
const cache = require('../../util/cache');

const getExploreNews = async (req, res) => {
  console.log(`##`);
  const { paging } = req.query;
  const result = await getLatestNews(paging, 10);
  return res.status(200).json({ data: result });
};

const getFeedNews = async (req, res) => {
  const { paging } = req.query;
  const { userData } = req.body;
  const result = await seleteFeedNews(paging, 10, userData.likeTags);
  return res.status(200).json({ data: result });
};

module.exports = { getExploreNews, getFeedNews };
