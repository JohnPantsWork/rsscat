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

async function selectrelationalTag(tag) {
    try {
        const [result] = await pool.query(
            `
        SELECT id, tag_id_2 as tag_name, COUNT(*) as count FROM rsscat.rss_data WHERE tag_id_1 = ? group by tag_name union all
          SELECT id, tag_id_3 as tag_name, COUNT(*) as count FROM rsscat.rss_data WHERE tag_id_1 = ? group by tag_name union all
          SELECT id, tag_id_1 as tag_name, COUNT(*) as count FROM rsscat.rss_data WHERE tag_id_2 = ? group by tag_name union all
          SELECT id, tag_id_3 as tag_name, COUNT(*) as count FROM rsscat.rss_data WHERE tag_id_2 = ? group by tag_name union all
          SELECT id, tag_id_1 as tag_name, COUNT(*) as count FROM rsscat.rss_data WHERE tag_id_3 = ? group by tag_name union all
          SELECT id, tag_id_2 as tag_name, COUNT(*) as count FROM rsscat.rss_data WHERE tag_id_3 = ? group by tag_name
          order by count desc`,
            [tag, tag, tag, tag, tag, tag]
        );
        return result[0];
    } catch (err) {
        console.error(err);
        return false;
    }
}

//
async function inserMultiRecord(userId, tag_id_arr, data_id, datatype_id) {
    try {
        let insertarr = [];
        for (let i = 0; i < tag_id_arr.length; i += 1) {
            insertarr.push([userId, tag_id_arr[i], data_id, datatype_id]);
        }
        const [result] = await pool.query('INSERT INTO record(user_id, tag_id, data_id, datatype_id) VALUES ?', [insertarr]);
        return result;
    } catch (err) {
        console.error(err);
        return false;
    }
}

async function selectTagId(tagName) {
    try {
        const [result] = await pool.query('SELECT id FROM tag_info WHERE tag_name = ?', [tagName]);
        return result;
    } catch (err) {
        console.error(err);
        return false;
    }
}

async function selectTagNames(ids) {
    try {
        if (ids.length === 0) {
            return [];
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
            'SELECT r.tag_id,COUNT(*) AS counts,ti.tag_name FROM record AS r INNER JOIN tag_info AS ti ON ti.id = r.tag_id WHERE user_id = ? GROUP BY tag_id ORDER BY counts DESC LIMIT 100',
            [userId]
        );
        return result;
    } catch (err) {
        console.error(err);
        return false;
    }
}

async function deleteUserRecord(userId, dataId, datatypeId) {
    try {
        await pool.query('DELETE FROM record WHERE user_id = ? AND data_id = ? AND datatype_id = ?', [userId, dataId, datatypeId]);
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
}

async function deleteAllUserRecord(userId) {
    try {
        await pool.query('DELETE FROM record WHERE user_id = ? ', [userId]);
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
}

module.exports = { getHotTags, selectTagId, selectTagNames, inserMultiRecord, selectUserRecord, deleteUserRecord, selectrelationalTag, deleteAllUserRecord };
