const { pool } = require('../../util/rdb');

async function getLatestRss(page, amount) {
  try {
    const start = page * amount;
    const [result] = await pool.query(
      `
    SELECT rd.id, title, auther, des, picture, url, tag_id_1, tag_id_2, tag_id_3, ti.tag_name AS tag1, ti2.tag_name AS tag2, ti3.tag_name AS tag3
    FROM rss_data AS rd 
      JOIN tag_info AS ti 
        ON ti.id = rd.tag_id_1 
      JOIN tag_info AS ti2
        ON ti2.id = rd.tag_id_2
      JOIN tag_info AS ti3
        ON ti3.id = rd.tag_id_3
        ORDER BY id DESC LIMIT ? OFFSET ?;`,
      [amount, start]
    );
    console.log(`#--------------------[result]#\n`, result);
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
    const [result] = await pool.query('SELECT title,auther,des,picture,url FROM rss_data WHERE tag_id_1 in (SELECT id FROM tag_info WHERE tag_name in (?)) ORDER BY id DESC LIMIT ? OFFSET ?', [
      tags,
      amount,
      start,
    ]);
    const [result2] = await pool.query('SELECT title,auther,des,picture,url FROM rss_data WHERE tag_id_2 in (SELECT id FROM tag_info WHERE tag_name in (?)) ORDER BY id DESC LIMIT ? OFFSET ?', [
      tags,
      amount,
      start,
    ]);
    const [result3] = await pool.query('SELECT title,auther,des,picture,url FROM rss_data WHERE tag_id_3 in (SELECT id FROM tag_info WHERE tag_name in (?)) ORDER BY id DESC LIMIT ? OFFSET ?', [
      tags,
      amount,
      start,
    ]);
    const all = result.concat(result2, result3);
    const noDuplicatResult = [...new Set(all)];
    return noDuplicatResult;
  } catch (err) {
    console.error(err);
    return false;
  }
}

module.exports = { getLatestRss, getTagRss };
