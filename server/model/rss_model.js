const { pool } = require('../../util/rdb');

async function getLatestRss(page, amount) {
    try {
        const start = page * amount;
        const [result] = await pool.query(
            `
      SELECT rd.id, re.title AS source, rd.title, auther, des, picture, rd.url, tag_id_1, tag_id_2, tag_id_3, ti.tag_name AS tag1, ti2.tag_name AS tag2, ti3.tag_name AS tag3
      FROM rss_data AS rd 
        JOIN tag_info AS ti 
          ON ti.id = rd.tag_id_1 
        JOIN tag_info AS ti2
          ON ti2.id = rd.tag_id_2
        JOIN tag_info AS ti3
          ON ti3.id = rd.tag_id_3
        JOIN rss_endpoint AS re
          ON re.id = rd.endpoint_id
      ORDER BY id DESC LIMIT ? OFFSET ?;`,
            [amount, start]
        );
        return result;
    } catch (err) {
        console.error(err);
        return false;
    }
}

async function getLatestRssWithDomain(page, amount, domain) {
    try {
        const start = page * amount;
        const [result] = await pool.query(
            `
            SELECT DISTINCT rs.id,re.title AS source, rs.title, auther, des, picture, rs.url, tag_id_1, tag_id_2, tag_id_3, ti.tag_name AS tag1, ti2.tag_name AS tag2, ti3.tag_name AS tag3
            FROM (SELECT * FROM rss_data WHERE endpoint_id in (?)) AS rs 
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
    } catch (err) {
        console.error(err);
        return false;
    }
}

async function selectRssByTitle(page, amount, title) {
    try {
        const start = page * amount;
        const [result] = await pool.query(
            `
      SELECT rd.id,re.title AS source, rd.title, auther, des, picture, rd.url, tag_id_1, tag_id_2, tag_id_3, ti.tag_name AS tag1, ti2.tag_name AS tag2, ti3.tag_name AS tag3
      FROM rss_data AS rd 
        JOIN tag_info AS ti 
          ON ti.id = rd.tag_id_1 
        JOIN tag_info AS ti2
          ON ti2.id = rd.tag_id_2
        JOIN tag_info AS ti3
          ON ti3.id = rd.tag_id_3
        JOIN rss_endpoint AS re
          ON re.id = rd.endpoint_id
      WHERE title like (%?%)
      ORDER BY id DESC LIMIT ? OFFSET ?;`,
            [amount, start, title]
        );
        return result;
    } catch (err) {
        console.error(err);
        return false;
    }
}

async function seleteFeedRss(page, amount, tags, domain) {
    try {
        if (!tags) {
            return false;
        }
        const start = page * amount;
        const [result] = await pool.query(
            `
      SELECT DISTINCT rs.id,re.title AS source, rs.title, auther, des, picture, rs.url, tag_id_1, tag_id_2, tag_id_3, ti.tag_name AS tag1, ti2.tag_name AS tag2, ti3.tag_name AS tag3
      FROM (SELECT * FROM rss_data WHERE endpoint_id in (?)) AS rs 
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
    } catch (err) {
        console.error(err);
        return false;
    }
}

async function getAllRssUrl() {
    try {
        const [result] = await pool.query('SELECT id FROM rss_endpoint');
        return result;
    } catch (err) {
        console.error(err);
        return false;
    }
}

async function seleteRssDomainName(domainIds) {
    try {
        if (domainIds.length === 0) {
            return false;
        }
        const [result] = await pool.query('SELECT id,title FROM rss_endpoint WHERE id IN (?)', [domainIds]);
        return result;
    } catch (err) {
        console.error(err);
        return false;
    }
}

async function rssUrlDuplicate(url) {
    try {
        const [result] = await pool.query('SELECT url FROM rss_endpoint WHERE url IN (?)', [url]);
        if (result.length > 0) {
            return true;
        }
        return false;
    } catch (err) {
        console.error(err);
        return false;
    }
}

async function insertNewRss(title, frequence, url) {
    try {
        await pool.query('INSERT INTO rss_endpoint(title, frequence, url) VALUES (?,?,?)', [title, frequence, url]);
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
}

async function selectLikedRss(userId, rssIds, datatypeId = 1) {
    try {
        const [result] = await pool.query('SELECT data_id FROM record WHERE user_id = ? AND datatype_id = ? AND data_id in (?) GROUP BY data_id', [userId, datatypeId, rssIds]);
        return result;
    } catch (err) {
        console.error(err);
        return false;
    }
}

module.exports = { getAllRssUrl, getLatestRss, getLatestRssWithDomain, seleteFeedRss, seleteRssDomainName, rssUrlDuplicate, insertNewRss, selectLikedRss, selectRssByTitle };
