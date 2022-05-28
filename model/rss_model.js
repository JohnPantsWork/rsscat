const { pool } = require('../util/rdb');

async function selectRssModel(page, amount) {
    const start = page * amount;
    const [result] = await pool.query(
        `
            SELECT DISTINCT rs.id,re.title AS source, rs.title, auther, des, picture, rs.url, tag_id_1, tag_id_2, tag_id_3, ti.tag_name AS tag1, ti2.tag_name AS tag2, ti3.tag_name AS tag3
            FROM rss_data AS rs 
            JOIN tag_info AS ti 
                ON ti.id = rs.tag_id_1 
            JOIN tag_info AS ti2
                ON ti2.id = rs.tag_id_2
            JOIN tag_info AS ti3
                ON ti3.id = rs.tag_id_3
            JOIN rss_endpoint AS re
                ON re.id = rs.endpoint_id
            ORDER BY id DESC LIMIT ? OFFSET ?;`,
        [amount, start]
    );
    return result;
}

async function filterRssByDomainModel(page, amount, domain) {
    const start = page * amount;
    const [result] = await pool.query(
        `
            SELECT DISTINCT rs.id,re.title AS source, rs.title, auther, des, picture, rs.url, tag_id_1, tag_id_2, tag_id_3, ti.tag_name AS tag1, ti2.tag_name AS tag2, ti3.tag_name AS tag3
            FROM (SELECT * FROM rss_data 
            WHERE endpoint_id in (?)) AS rs 
            JOIN tag_info AS ti 
                ON ti.id = rs.tag_id_1 
            JOIN tag_info AS ti2
                ON ti2.id = rs.tag_id_2
            JOIN tag_info AS ti3
                ON ti3.id = rs.tag_id_3
            JOIN rss_endpoint AS re
                ON re.id = rs.endpoint_id
            ORDER BY id DESC LIMIT ? OFFSET ?;`,
        [domain, amount, start]
    );
    return result;
}

async function filterRssByTagAndDomainModel(page, amount, tags, domain) {
    if (!tags) {
        return false;
    }
    const start = page * amount;
    const [result] = await pool.query(
        `
            SELECT DISTINCT rs.id,re.title AS source, rs.title, auther, des, picture, rs.url, tag_id_1, tag_id_2, tag_id_3, ti.tag_name AS tag1, ti2.tag_name AS tag2, ti3.tag_name AS tag3
            FROM (SELECT * FROM rss_data
            WHERE endpoint_id in (?)) AS rs 
            JOIN tag_info AS ti 
                ON ti.id = rs.tag_id_1 
            JOIN tag_info AS ti2
                ON ti2.id = rs.tag_id_2
            JOIN tag_info AS ti3
                ON ti3.id = rs.tag_id_3
            JOIN rss_endpoint AS re
                ON re.id = rs.endpoint_id
            WHERE tag_id_1 in (?) OR tag_id_2 in (?) OR tag_id_3 in (?) 
            ORDER BY id DESC 
            LIMIT ? OFFSET ?`,
        [domain, tags, tags, tags, amount, start]
    );
    const noDuplicatResult = [...new Set(result)];
    return noDuplicatResult;
}

async function selectRssDomainModel() {
    const [result] = await pool.query('SELECT id FROM rss_endpoint');
    return result;
}

async function filterRssDomainModel(domainIds) {
    if (domainIds.length === 0) {
        return false;
    }
    const [result] = await pool.query('SELECT id,title FROM rss_endpoint WHERE id IN (?)', [
        domainIds,
    ]);
    return result;
}

async function selectRssUrlModel(url) {
    const [result] = await pool.query('SELECT url FROM rss_endpoint WHERE url IN (?)', [url]);
    if (result.length > 0) {
        return true;
    }
    return false;
}

async function insertRssModel(title, frequence, url) {
    await pool.query('INSERT INTO rss_endpoint(title, frequence, url) VALUES (?,?,?)', [
        title,
        frequence,
        url,
    ]);
    return true;
}

async function selectLikedRssModel(userId, rssIds, datatypeId = 1) {
    const [result] = await pool.query(
        'SELECT data_id FROM record WHERE user_id = ? AND datatype_id = ? AND data_id in (?) GROUP BY data_id',
        [userId, datatypeId, rssIds]
    );
    return result;
}

module.exports = {
    filterRssByDomainModel,
    filterRssByTagAndDomainModel,
    filterRssDomainModel,
    insertRssModel,
    selectRssDomainModel,
    selectRssModel,
    selectRssUrlModel,
    selectLikedRssModel,
};
