const { pool } = require('../util/rdb');

async function selectStoreModel() {
    let [result] = await pool.query(`SELECT * FROM store ORDER BY price `);
    return result;
}

async function selectMissionModel() {
    const [result] = await pool.query(`SELECT * FROM mission`);
    return result;
}

async function selectStoreItemModel(title) {
    const [result] = await pool.query(`SELECT title,price FROM store WHERE title = ?`, [title]);
    return result[0];
}

module.exports = { selectStoreModel, selectMissionModel, selectStoreItemModel };
