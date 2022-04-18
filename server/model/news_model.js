const pool = require('../../util/rdb');

async function getLatestNews(amount = 3, page = 0) {
  try {
    const start = page * amount;
    const [result] = await pool.query(
      'SELECT title,source,auther,des,picture,url FROM news_data ORDER BY id DESC LIMIT ? OFFSET ? ',
      [start, amount]
    );
    return result;
  } catch (err) {
    console.error(err);
    return false;
  }
}

// tags = ['string-tagid','string-tagid']
async function getTagNews(tags, amount = 3, page = 0) {
  try {
    const start = page * amount;
    const [result] = await pool.query(
      'SELECT title,source,auther,des,picture,url FROM news_data ORDER BY id DESC LIMIT ? OFFSET ? WHERE tag1 in ',
      [start, amount]
    );
    return result;
  } catch (err) {
    console.error(err);
    return false;
  }
}

module.exports = { getLatestNews, getTagNews };
