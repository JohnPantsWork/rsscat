require('dotenv').config();
const { pool } = require('../util/rdb');
const SQL_INSERT_AMOUNT = 5;

const insertArticles = async (id, newArticles, latestArticle) => {
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
const insertNews = async (id, newArticles, latestArticle) => {
    const conn = await pool.getConnection();
    try {
        await conn.query('START TRANSACTION;');
        await conn.query('LOCK TABLES news_data WRITE;');
        for (let j = 0; j < newArticles.length; j += SQL_INSERT_AMOUNT) {
            const temp = newArticles.slice(j, j + SQL_INSERT_AMOUNT);
            await conn.query(
                'INSERT INTO news_data(endpoint_id, latest_date, title, source, auther, des, picture, url, tag_id_1, tag_id_2, tag_id_3) VALUES ?',
                [temp]
            );
        }
        await conn.query('UNLOCK TABLES');
        await conn.query('LOCK TABLES news_endpoint WRITE;');
        await conn.query('UPDATE news_endpoint SET latest_article = ? WHERE id = ?', [
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
const insertTagInfo = async (insertTagInfo) => {
    await pool.query(
        'INSERT INTO tag_info (tag_name,appear_times) VALUES (?,1) ON DUPLICATE KEY UPDATE appear_times = appear_times + 1;',
        [insertTagInfo]
    );
};

const selectRssUrls = async (id) => {
    const [rssUrls] = await pool.query(
        'SELECT id,url,frequence,latest_article FROM rss_endpoint WHERE id = ?',
        [id]
    );
    return rssUrls;
};

const selectLatestNewsArticle = async () => {
    const [result] = await pool.query('SELECT latest_article FROM news_endpoint WHERE title = ?', [
        'newsapi',
    ]);
    return result;
};
const selectLatestRssArticle = async (id) => {
    const [result] = await pool.query('SELECT latest_article FROM rss_endpoint WHERE id = ?', [id]);
    return result;
};

const selectIdFromTagName = async (tagNames) => {
    const [result] = await pool.query('SELECT id FROM tag_info WHERE tag_name in (?)', [tagNames]);
    return result;
};

const selectAllArticlesAmount = async () => {
    const [result] = await pool.query(`select sum(two.id) as amount
    from
       (
       select count(id) as id from rsscat.news_data
       UNION ALL
       select count(id) as id from rsscat.rss_data
       ) two;`);
    return result[0].amount;
};

const selectTagAppearTime = async (keysArray) => {
    const [result] = await pool.query(
        'SELECT tag_name,appear_times FROM tag_info WHERE tag_name IN (?)',
        [keysArray]
    );
    return result;
};

module.exports = {
    insertArticles,
    insertNews,
    insertTagInfo,
    selectRssUrls,
    selectLatestRssArticle,
    selectLatestNewsArticle,
    selectIdFromTagName,
    selectTagAppearTime,
    selectAllArticlesAmount,
};
