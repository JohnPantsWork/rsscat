require('dotenv').config();
const { CKIP_ENDPOINT } = process.env;
const axios = require('axios');

const postCutWordsPython = async (req, res) => {
  const { raw_words } = req.body;
  console.log(`#--------------------[]#\n`);
  const cutWordsResult = await axios({
    method: 'POST',
    url: CKIP_ENDPOINT,
    data: {
      raw_words: raw_words,
    },
  });

  return res.status(200).json({ data: cutWordsResult.data });
};

const postCutWordsJieba = async (req, res) => {
  const { raw_words } = req.body;
  console.log(`#--------------------[]#\n`);
  const cutWordsResult = await axios({
    method: 'POST',
    url: CKIP_ENDPOINT,
    data: {
      raw_words: raw_words,
    },
  });

  return res.status(200).json({ data: cutWordsResult.data });
};

module.exports = {
  postCutWordsPython,
  postCutWordsJieba,
};
