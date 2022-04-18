require('dotenv').config();
const { getLatestRss, getTagRss } = require('../model/rss_model');

const getExploreRss = async (req, res) => {
  const result = await getLatestRss(0, 100);
  console.log(`#--------------------[result]#\n`, result);
  return res.status(200).json({ data: 'data' });
};

module.exports = { getExploreRss };
