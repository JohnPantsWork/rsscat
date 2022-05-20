const { pool } = require('../../util/rdb');
const { newErrRes } = require('../../util/util');

async function selectCatStore() {
    try {
        const [result] = await pool.query(`SELECT * FROM store ORDER BY price `);
        return result;
    } catch (err) {
        console.error(err);
        return newErrRes(500, '');
    }
}

async function selectMission() {
    try {
        const [result] = await pool.query(`SELECT * FROM mission`);
        return result;
    } catch (err) {
        console.error(err);
        return false;
    }
}

async function selectStoreItem(title) {
    try {
        const [result] = await pool.query(`SELECT title,price FROM store WHERE title = ?`, [title]);
        return result[0];
    } catch (err) {
        console.error(err);
        return false;
    }
}

module.exports = { selectCatStore, selectMission, selectStoreItem };
