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
async function inserMultiRecord(userId, tag_id_arr, data_id, datatype_id) {
  try {
    let insertarr = [];
    console.log(`#tag_id_arr.length#`, tag_id_arr.length);
    console.log(`#tag_id_arr[0]#`, tag_id_arr[0]);
    console.log(`#tag_id_arr[1]#`, tag_id_arr[1]);
    console.log(`#tag_id_arr[2]#`, tag_id_arr[2]);
    for (let i = 0; i < tag_id_arr.length; i += 1) {
      insertarr.push([userId, tag_id_arr[i], data_id, datatype_id]);
    }
    console.log(`#insertarr#`, insertarr);
    const [result] = await pool.query('INSERT INTO record(user_id, tag_id, data_id, datatype_id) VALUES ?', [insertarr]);
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

async function selectUserRecord(userId) {
  try {
    const [result] = await pool.query(
      'SELECT r.tag_id,COUNT(*),ti.tag_name FROM record AS r INNER JOIN tag_info AS ti ON ti.id = r.tag_id WHERE user_id = ? GROUP BY tag_id ORDER BY COUNT(*) DESC LIMIT 100',
      [userId]
    );
    return result;
  } catch (err) {
    console.error(err);
    return false;
  }
}

module.exports = { getHotTags, selectTagId, selectTagNames, inserMultiRecord, selectUserRecord };
