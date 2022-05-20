// npm package
require('dotenv').config();
const cheerio = require('cheerio');
const axios = require('axios');
const NewsAPI = require('newsapi');

// internal package
const { pool } = require('./util/rdb');
const { rssParser } = require('./util/rssParser');
const { arrayObjValue, objKeyArray } = require('./util/util');
const { skip_part } = require('./data/chinese/skip_part');
const { skipWords } = require('../../../data/chinese/stopwords_zh.js');

// environment
const { NEWS_API_KEY, CKIP_URL } = process.env;
const newsapi = new NewsAPI(NEWS_API_KEY);
const CONNECT_TIMEOUT = parseInt(process.env.CONNECT_TIMEOUT);
const ARTICLES_LIMIT = parseInt(process.env.ARTICLES_LIMIT);

// const
const RSS_DES_INDEX = 4;
const NEWS_DES_INDEX = 5;
const RSS_URL_INDEX = 6;
const NEWS_URL_INDEX = 7;
const SQL_INSERT_AMOUNT = 5;
const MAX_WORDS_LIMIT = 2000;
const TAGS_PER_ARTICLES = 2000;

async function checkNewArticle(id, url, latest_article) {
    const rawDatas = await rssParser(url);
    if (!rawDatas) {
        return false;
    }

    // If article url is duplicated from the latest article, stop push if so.
    const newArticles = [];
    const items = rawDatas.items;
    const limit = ARTICLES_LIMIT;
    for (let i = 0; i < items.length && i < limit; i += 1) {
        if (items[i].link === latest_article) {
            break;
        }
        newArticles.push(items[i]);
    }
    return newArticles;
}

// format each raw article into array, easier to use.
async function formatArticles(id, rawArticles) {
    const today = getTodayDate();

    // prepare for insert db.
    const datas = [];
    const checkDuplicate = new Set();

    // make array in order to insert.
    for (let j = 0; j < rawArticles.length; j += 1) {
        // for (let j = 0; j < 1; j += 1) {
        const e = rawArticles[j];
        const beforeSize = checkDuplicate.size;
        checkDuplicate.add(e.title);
        if (beforeSize === checkDuplicate.size) {
            return;
        }

        // check if title or contentSnippet is not available
        if (!e.title || !e.contentSnippet || !e.link) {
            return;
        }
        const rssDate = e.isoDate ? e.isoDate.slice(0, 10) : today;
        const rssContent = e.contentSnippet.length > MAX_WORDS_LIMIT ? e.contentSnippet.slice(0, MAX_WORDS_LIMIT) + '......' : e.contentSnippet;
        const rssPicture = await xmlGetImage(e.content, e.link);
        const data = [id, rssDate, e.title, e['dc:creator'], rssContent, rssPicture, e.link];
        datas.push(data);
    }
    return datas;
}

async function insertArticles(id, newArticles) {
    if (newArticles.length === 0) {
        return;
    }
    // insert model
    const conn = await pool.getConnection();
    try {
        await conn.query('START TRANSACTION;');
        await conn.query('LOCK TABLES rss_data WRITE;');
        for (let j = 0; j < newArticles.length; j += SQL_INSERT_AMOUNT) {
            const temp = newArticles.slice(j, j + SQL_INSERT_AMOUNT);
            await conn.query('INSERT INTO rss_data(endpoint_id, latest_date, title, auther, des, picture, url, tag_id_1, tag_id_2, tag_id_3) VALUES ?', [temp]);
        }
        await conn.query('UNLOCK TABLES');

        await conn.query('LOCK TABLES rss_endpoint WRITE;');
        const latestArticle = newArticles[0][RSS_URL_INDEX];
        await conn.query('UPDATE rss_endpoint SET latest_article = ? WHERE id = ?', [latestArticle, id]);

        await conn.query('COMMIT');
    } catch (err) {
        await conn.query('ROLLBACK');
    } finally {
        await conn.query('UNLOCK TABLES');
        await conn.release();
    }
}

// if xml doesn't have img, crawler from url instead.
async function xmlGetImage(xml, url) {
    const tempArr = xml.split('"');
    let photoPath;
    for (let i = 0; i < tempArr.length; i += 1) {
        const temp = tempArr[i];
        if (temp.includes('.jpg') || temp.includes('.jpeg') || temp.includes('.png')) {
            if (temp.includes('http')) {
                photoPath = temp;
                return photoPath;
            }
        }
    }
    // if articles doesn't have any image in it, crawl from website.
    try {
        const result = await axios({
            method: 'GET',
            url: url,
            timeout: CONNECT_TIMEOUT,
        });

        const $ = cheerio.load(result.data);
        photoPath = $('meta[property="og:image"]').attr().content;

        if (photoPath === null) {
            return '';
        } else {
            return photoPath;
        }
    } catch (err) {
        return '';
    }
}

async function updateCenterCheckedArray(level, id) {
    const [status] = await pool.query('SELECT * FROM worker_center WHERE id = 1');
    const rss_checked_array = JSON.parse(status[0].latest_rss_checked_array);
    rss_checked_array[level] = id;
    const arrString = JSON.stringify(rss_checked_array);
    await pool.query('UPDATE worker_center SET latest_rss_checked_array=?', [arrString]);
}

async function checkNewNews() {
    let news = await newsapi.v2.topHeadlines({
        country: 'tw',
    });
    if (news.status !== 'ok') {
        return;
    }

    const [result] = await pool.query('SELECT latest_article FROM news_endpoint WHERE title = ?', ['newsapi']);
    const latest_article = result[0].latest_article;
    let rawNews = [];
    for (let n of news.articles) {
        if (n.url === latest_article) {
            break;
        }
        rawNews.push(n);
    }
    return rawNews;
}

async function formatNews(id, rawNews) {
    let formatedNews = [];
    const limit = ARTICLES_LIMIT;
    for (let i = 0; i < rawNews.length && i < limit; i += 1) {
        const n = rawNews[i];
        const newsDate = n.publishedAt.slice(0, 10);
        const newsSource = n['source']['name'];
        const temp = [id, newsDate, n.title, newsSource, n.author, n.description, n.urlToImage, n.url];
        formatedNews.push(temp);
    }
    return formatedNews;
}

async function insertNews(id, news) {
    if (news.length === 0) {
        return;
    }

    const conn = await pool.getConnection();
    try {
        await conn.query('START TRANSACTION;');
        await conn.query('LOCK TABLES news_data WRITE;');
        for (let j = 0; j < news.length; j += SQL_INSERT_AMOUNT) {
            const temp = news.slice(j, j + SQL_INSERT_AMOUNT);
            await conn.query('INSERT INTO news_data(endpoint_id, latest_date, title, source, auther, des, picture, url, tag_id_1, tag_id_2, tag_id_3) VALUES ?', [temp]);
        }
        await conn.query('UNLOCK TABLES');
        await conn.query('LOCK TABLES news_endpoint WRITE;');
        const latestArticle = news[0][NEWS_URL_INDEX];
        await conn.query('UPDATE news_endpoint SET latest_article = ? WHERE id = ?', [latestArticle, id]);
        await conn.query('COMMIT');
    } catch (err) {
        await conn.query('ROLLBACK');
    } finally {
        await conn.query('UNLOCK TABLES');
        await conn.release();
    }
}

async function articleTagging(formatedData, type) {
    let des_index;
    switch (type) {
        case 'rss':
            des_index = RSS_DES_INDEX;
            break;
        case 'news':
            des_index = NEWS_DES_INDEX;
            break;
        default:
            break;
    }

    const formatedDataWithTagging = [];
    for (let i = 0; i < formatedData.length; i += 1) {
        const des = formatedData[i][des_index];
        const cutWords = await ckip(des);
        const tdR = await td(cutWords);
        const insert_tag_info = await objKeyArray(tdR);
        for (let j = 0; j < insert_tag_info.length; j += 1) {
            await pool.query('INSERT INTO tag_info (tag_name,appear_times) VALUES (?,1) ON DUPLICATE KEY UPDATE appear_times = appear_times + 1;', [insert_tag_info[j]]);
        }

        const topTags = await td_idf(tdR, TAGS_PER_ARTICLES);

        if (topTags.length < TAGS_PER_ARTICLES) {
            continue;
        }

        const tags = topTags.map((e) => {
            return e[0];
        });
        const rawTagIds = await tagNameToId(tags);
        const tagIds = arrayObjValue(rawTagIds);

        formatedDataWithTagging.push(formatedData[i].concat(tagIds));
    }
    return formatedDataWithTagging;
}

async function ckip(des) {
    // send des to ckip.
    const result = await axios({
        method: 'POST',
        url: `${CKIP_URL}`,
        data: { raw_words: des },
    });
    const pos = result.data.data.pos;
    const sPos = pos.split('),');
    const filterPos = sPos.filter((p) => {
        const [a, b] = p.split('(');
        if (skip_part.indexOf(b) === -1) {
            return a;
        }
    });
    const keyPos = filterPos.map((p) => {
        return p.split('(')[0];
    });
    return keyPos;
}

function getTodayDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = `0${now.getMonth()}`.slice(-2);
    const day = `0${now.getDay()}`.slice(-2);
    const today = `${year}-${month}-${day}`;
    return today;
}

const tagNameToId = async (tagNames) => {
    const [result] = await pool.query('SELECT id FROM tag_info WHERE tag_name in (?)', [tagNames]);
    return result;
};

async function td(words_tags) {
    const singleData = {};
    const totalLength = words_tags.length;
    for (let i = 0; i < totalLength; i += 1) {
        if (words_tags[i].length > 16 || skipWords.includes(words_tags[i])) {
            continue;
        }
        if (singleData[words_tags[i]]) {
            singleData[words_tags[i]].highlights += 1 / totalLength;
        } else {
            singleData[words_tags[i]] = {};
            singleData[words_tags[i]].highlights = 1 / totalLength;
        }
    }
    return singleData;
}

async function td_idf(dataObj, amount) {
    const keysArray = await Object.keys(dataObj);
    const [idfs] = await pool.query('SELECT tag_name,appear_times FROM tag_info WHERE tag_name IN (?)', [keysArray]);
    let idfDict = {};
    idfs.map((obj) => {
        if (!dataObj[obj.tag_name] || !dataObj[obj.tag_name].highlights) {
            return;
        }
        const percent = 10000 * (1 / obj.appear_times) * dataObj[obj.tag_name].highlights;
        idfDict[obj.tag_name] = percent;
    });
    return topValues(idfDict, amount);
}

module.exports = { checkNewArticle, formatArticles, insertArticles, xmlGetImage, updateCenterCheckedArray, checkNewNews, formatNews, insertNews, articleTagging };
