require('dotenv').config();
const { pool } = require('../util/rdb');
const RSS_URL_INDEX = 6;
const NEWS_URL_INDEX = 7;
const SQL_INSERT_AMOUNT = 5;
const NEWS_API_ID = 1;

const selectRssUrls = async (id) => {
    const [rssUrls] = await pool.query(
        'SELECT id,url,frequence,latest_article FROM rss_endpoint WHERE id = ?',
        [id]
    );
    return rssUrls;
};

const insertArticles = async (id, newArticles) => {
    const conn = await pool.getConnection();
    try {
        await conn.query('START TRANSACTION;');
        await conn.query('LOCK TABLES rss_data WRITE;');

        for (let j = 0; j < newArticles.length; j += SQL_INSERT_AMOUNT) {
            const temp = newArticles.slice(j, j + SQL_INSERT_AMOUNT);
            await conn.query(
                'INSERT INTO rss_data(endpoint_id, latest_date, title, auther, des, picture, url, tag_id_1, tag_id_2, tag_id_3) VALUES ?',
                [temp]
            );
        }
        await conn.query('UNLOCK TABLES');

        await conn.query('LOCK TABLES rss_endpoint WRITE;');
        const latestArticle = newArticles[0][RSS_URL_INDEX];
        await conn.query('UPDATE rss_endpoint SET latest_article = ? WHERE id = ?', [
            latestArticle,
            id,
        ]);

        await conn.query('COMMIT');
    } catch (err) {
        await conn.query('ROLLBACK');
    } finally {
        await conn.query('UNLOCK TABLES');
        await conn.release();
    }
};

const selectCenterStatus = async () => {
    const [status] = await pool.query('SELECT * FROM worker_center WHERE id = 1');
    return status;
};
const updateWorkerCenterRssChecked = async (arrString) => {
    await pool.query('UPDATE worker_center SET latest_rss_checked_array=?', [arrString]);
};
const selectLatestNewsArticle = async () => {
    const [result] = await pool.query('SELECT latest_article FROM news_endpoint WHERE title = ?', [
        'newsapi',
    ]);
    return result;
};
const insertNews = async (news) => {
    const conn = await pool.getConnection();
    try {
        await conn.query('START TRANSACTION;');
        await conn.query('LOCK TABLES news_data WRITE;');
        for (let j = 0; j < news.length; j += SQL_INSERT_AMOUNT) {
            const temp = news.slice(j, j + SQL_INSERT_AMOUNT);
            await conn.query(
                'INSERT INTO news_data(endpoint_id, latest_date, title, source, auther, des, picture, url, tag_id_1, tag_id_2, tag_id_3) VALUES ?',
                [temp]
            );
        }
        await conn.query('UNLOCK TABLES');
        await conn.query('LOCK TABLES news_endpoint WRITE;');
        const latestArticle = news[0][NEWS_URL_INDEX];
        await conn.query('UPDATE news_endpoint SET latest_article = ? WHERE id = ?', [
            latestArticle,
            NEWS_API_ID,
        ]);
        await conn.query('COMMIT');
    } catch (err) {
        await conn.query('ROLLBACK');
    } finally {
        await conn.query('UNLOCK TABLES');
        await conn.release();
    }
};
const insertTagInfo = async (insertTagInfo) => {
    await pool.query(
        'INSERT INTO tag_info (tag_name,appear_times) VALUES (?,1) ON DUPLICATE KEY UPDATE appear_times = appear_times + 1;',
        [insertTagInfo]
    );
};
const selectIdFromTagName = async (tagNames) => {
    const [result] = await pool.query('SELECT id FROM tag_info WHERE tag_name in (?)', [tagNames]);
    return result;
};
const selectTagAppearTime = async (keysArray) => {
    const [result] = await pool.query(
        'SELECT tag_name,appear_times FROM tag_info WHERE tag_name IN (?)',
        [keysArray]
    );
    return result;
};

module.exports = {
    selectRssUrls,
    insertArticles,
    selectCenterStatus,
    updateWorkerCenterRssChecked,
    selectLatestNewsArticle,
    insertNews,
    insertTagInfo,
    selectIdFromTagName,
    selectTagAppearTime,
};
