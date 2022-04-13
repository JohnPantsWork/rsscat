require('dotenv').config();
const { CKIP_ENDPOINT } = process.env;
const axios = require('axios');

const { SHORT_RAND_ENDPOINT } = process.env;

const cutWords = async (req, res) => {
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
  cutWords,
};
