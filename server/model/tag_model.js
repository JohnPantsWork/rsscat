const { pool } = require('../../util/rdb');

// timeRange=1 7 or 30, int number
async function getHotTags(timeRange) {
  try {
    const [result] = await pool.query('SELECT * FROM tag_data where date(latest_date) = CURDATE() - interval ? day GROUP BY tag_id', [timeRange]);
    return result;
  } catch (err) {
    console.error(err);
    return false;
  }
}

//
async function inserRecord(userId, tag_id, data_id, datatype_id, today) {
  try {
    const [result] = await pool.query('INSERT INTO record(user_id, tag_id, data_id, datatype_id, latest_date) VALUES (?,?,?,?,?))', [userId, tag_id, data_id, datatype_id, today]);
    return result;
  } catch (err) {
    console.error(err);
    return false;
  }
}

async function selectTagId(tag_name) {
  try {
    const [result] = await pool.query('SELECT id FROM tag_info WHERE tag_name = ?', [tag_name]);
    return result;
  } catch (err) {
    console.error(err);
    return false;
  }
}

async function selectTagNames(ids) {
  try {
    if (ids.length === 0) {
      return false;
    }
    const [result] = await pool.query('SELECT id,tag_name FROM tag_info WHERE id in (?)', [ids]);
    return result;
  } catch (err) {
    console.error(err);
    return false;
  }
}

module.exports = { getHotTags, inserRecord, selectTagId, selectTagNames };
