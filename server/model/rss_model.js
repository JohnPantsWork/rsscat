const pool = require('../../util/rdb');

async function getLatestRss(page, amount) {
  try {
    const start = page * amount;
    const [result] = await pool.query('SELECT title,source,auther,des,picture,url FROM news_data ORDER BY id DESC LIMIT ? OFFSET ? ', [start, amount]);
    return result;
  } catch (err) {
    console.error(err);
    return false;
  }
}

// tags = ['string-tagid','string-tagid']
async function getTagRss(page, amount, tags) {
  try {
    const start = page * amount;
    const [result] = await pool.query('SELECT title,source,auther,des,picture,url FROM news_data ORDER BY id DESC LIMIT ? OFFSET ? WHERE tag_id_1 in ?', [start, amount, tags]);
    return result;
  } catch (err) {
    console.error(err);
    return false;
  }
}

module.exports = { getLatestRss, getTagRss };
