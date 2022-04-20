require('dotenv').config();
const { getLatestRss, getTagRss } = require('../model/rss_model');

const getExploreRss = async (req, res) => {
  const { paging } = req.query;
  const result = await getLatestRss(paging, 10);
  return res.status(200).json({ data: result });
};

const getFeedRss = async (req, res) => {
  const { paging } = req.query;
  const { tags } = req.body;
  const tagArray = tags.map((tag) => {
    return tag.name;
  });
  const result = await getTagRss(paging, 100, tagArray);
  return res.status(200).json({ data: result });
};

module.exports = { getExploreRss, getFeedRss };
