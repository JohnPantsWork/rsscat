const { pool } = require('../util/rdb');

async function inserMultiRecordModel(userId, tag_id_arr, data_id, datatype_id) {
    let insertarr = [];
    for (let i = 0; i < tag_id_arr.length; i += 1) {
        insertarr.push([userId, tag_id_arr[i], data_id, datatype_id]);
    }
    const [result] = await pool.query(
        'INSERT INTO record(user_id, tag_id, data_id, datatype_id) VALUES ?',
        [insertarr]
    );
    return result;
}

async function selectTagIdModel(tagName) {
    const [result] = await pool.query('SELECT id FROM tag_info WHERE tag_name = ?', [tagName]);
    return result;
}

async function selectTagNamesModel(ids) {
    if (ids.length === 0) {
        return [];
    }
    const [result] = await pool.query('SELECT id,tag_name FROM tag_info WHERE id in (?)', [ids]);
    return result;
}

async function selectUserRecordModel(userId) {
    const [result] = await pool.query(
        `
            SELECT r.tag_id,COUNT(*) AS counts,ti.tag_name 
            FROM record AS r 
            INNER JOIN tag_info AS ti 
                ON ti.id = r.tag_id 
            WHERE user_id = ? 
            GROUP BY tag_id 
            ORDER BY counts DESC 
            LIMIT 100`,
        [userId]
    );
    return result;
}

async function deleteUserRecordModel(userId, dataId, datatypeId) {
    await pool.query(
        `DELETE FROM record
            WHERE user_id = ? AND data_id = ? AND datatype_id = ?`,
        [userId, dataId, datatypeId]
    );
    return true;
}

async function deleteAllUserRecordModel(userId) {
    await pool.query(
        `DELETE FROM record 
            WHERE user_id = ? `,
        [userId]
    );
    return true;
}

module.exports = {
    selectTagIdModel,
    selectTagNamesModel,
    inserMultiRecordModel,
    selectUserRecordModel,
    deleteUserRecordModel,
    deleteAllUserRecordModel,
};
