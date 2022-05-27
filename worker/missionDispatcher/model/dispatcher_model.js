const { pool } = require('../util/rdb');

const selectRssFrequenceCounts = async () => {
    const [result] = await pool.query('SELECT * FROM rss_endpoint');
    return result;
};

module.exports = { selectRssFrequenceCounts };
