const { pool } = require('../util/rdb');

const selectRssFrequenceCounts = async (id, limit) => {
    const [result] = await pool.query('SELECT id,url FROM rss_endpoint where id > ? LIMIT ?', [
        id,
        limit,
    ]);
    return result;
};

const selectCenterStatus = async () => {
    const [status] = await pool.query('SELECT * FROM worker_center WHERE id = 1');
    return status;
};

const updateCenterStatus = async (id) => {
    const [status] = await pool.query('UPDATE worker_center SET latest_mission=? WHERE id = 1', [
        id,
    ]);
    return status;
};

module.exports = { selectRssFrequenceCounts, selectCenterStatus, updateCenterStatus };
