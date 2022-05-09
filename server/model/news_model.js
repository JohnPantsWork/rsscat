const { pool } = require('../../util/rdb');

async function getLatestNews(page, amount) {
  try {
    const start = page * amount;
    const [result] = await pool.query(
      `
      SELECT nd.id, title, source, auther, des, picture, url, tag_id_1, tag_id_2, tag_id_3, ti.tag_name AS tag1, ti2.tag_name AS tag2, ti3.tag_name AS tag3
      FROM news_data AS nd 
        JOIN tag_info AS ti 
          ON ti.id = nd.tag_id_1 
        JOIN tag_info AS ti2
          ON ti2.id = nd.tag_id_2
        JOIN tag_info AS ti3
          ON ti3.id = nd.tag_id_3
          ORDER BY nd.id DESC LIMIT ? OFFSET ?;`,
      [amount, start]
    );
    return result;
  } catch (err) {
    console.error(err);
    return false;
  }
}

async function selectNewsByTitle(page, amount, title) {
  try {
    const start = page * amount;
    const [result] = await pool.query(
      `
      SELECT nd.id, title, source, auther, des, picture, url, tag_id_1, tag_id_2, tag_id_3, ti.tag_name AS tag1, ti2.tag_name AS tag2, ti3.tag_name AS tag3
      FROM news_data AS nd 
        JOIN tag_info AS ti 
          ON ti.id = nd.tag_id_1 
        JOIN tag_info AS ti2
          ON ti2.id = nd.tag_id_2
        JOIN tag_info AS ti3
          ON ti3.id = nd.tag_id_3
      WHERE title like (%?%)
      ORDER BY nd.id DESC LIMIT ? OFFSET ?;`,
      [amount, start, title]
    );
    return result;
  } catch (err) {
    console.error(err);
    return false;
  }
}

async function seleteFeedNews(page, amount, tags) {
  try {
    const start = page * amount;
    const [result] = await pool.query(
      `
      SELECT DISTINCT nd.id, nd.title, source, auther, des, picture, nd.url, tag_id_1, tag_id_2, tag_id_3, ti.tag_name AS tag1, ti2.tag_name AS tag2, ti3.tag_name AS tag3
      FROM news_data AS nd
        JOIN tag_info AS ti 
          ON ti.id = nd.tag_id_1 
        JOIN tag_info AS ti2
          ON ti2.id = nd.tag_id_2
        JOIN tag_info AS ti3
          ON ti3.id = nd.tag_id_3
        JOIN news_endpoint AS re
          ON re.id = nd.endpoint_id
      WHERE tag_id_1 in (?) OR tag_id_2 in (?) OR tag_id_3 in (?) 
      ORDER BY id DESC 
      LIMIT ? OFFSET ?`,
      [tags, tags, tags, amount, start]
    );

    const noDuplicatResult = [...new Set(result)];
    return noDuplicatResult;
  } catch (err) {
    console.error(err);
    return false;
  }
}

async function selectLikedNews(userId, newsIds, datatypeId = 2) {
  try {
    const [result] = await pool.query('SELECT data_id FROM record WHERE user_id = ? AND datatype_id = ? AND data_id in (?) GROUP BY data_id', [userId, datatypeId, newsIds]);
    return result;
  } catch (err) {
    console.error(err);
    return false;
  }
}

module.exports = { getLatestNews, seleteFeedNews, selectLikedNews, selectNewsByTitle };
