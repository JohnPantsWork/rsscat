require('dotenv').config();
const { CKIP_ENDPOINT } = process.env;
const { jiebaTag } = require('../../util/words');

const axios = require('axios');

const postCutWordsPython = async (req, res) => {
  const { raw_words } = req.body;
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
  const cutWordsResult = jiebaTag(raw_words);
  return res.status(200).json({ data: cutWordsResult });
};

module.exports = {
  postCutWordsPython,
  postCutWordsJieba,
};
