require('dotenv').config();
const { pool } = require('../util/rdb_mysql');
const cache = require('../util/cache');
const { rssParser } = require('../util/rss_parser');
const cheerio = require('cheerio');
const axios = require('axios');
const NewsAPI = require('newsapi');

const fs = require('fs');

const { MISSION_LIST, GOOGLENEWS_API_URL, GOOGLENEWS_API_HOST, GOOGLENEWS_API_KEY, NEWS_API_KEY } =
  process.env;
const newsapi = new NewsAPI(NEWS_API_KEY);

checkMission();
async function checkMission() {
  while (true) {
    console.log(`#check mission#`);
    const nextMission = await cache.brpop(MISSION_LIST, 1000);
    if (nextMission === undefined || nextMission === null) {
      continue;
    }
    const newM = await JSON.parse(nextMission[1]);

    switch (newM.mission) {
      case 'checkRssUpdate':
        console.log(`#checkRssUpdate#`);
        const { latest_id, amount, level } = newM;
        await checkRssUpdate(latest_id, amount, level);
        break;

      case 'checkNewsApiUpdate':
        console.log(`#checkNewsApiUpdate#`);
        await checkNewsApiUpdate();
        break;

      case 'checkGoogleApiUpdate':
        console.log(`#checkGoogleApiUpdate#`);
        await checkGoogleApiUpdate();
        break;

      default:
        break;
    }
  }
}

// functions
// mission level deside which endpoint level should update this time.
async function checkRssUpdate(latest_id, amount, level) {
  console.log(`#--------------------[checkRssUpdate]#\n`);
  // get endpoints depends on level and id.
  let [rssDatas] = await pool.query(
    'SELECT id,url,frequence,latest_article FROM rss_endpoint WHERE id > ? AND frequence = ? ORDER BY id LIMIT ? ',
    [latest_id, level, amount]
  );

  // if less then 5, start from beginning.
  if (rssDatas.length < 5) {
    const newAmount = amount - rssDatas.length;
    const [moreUrls] = await pool.query(
      'SELECT id,url,frequence,latest_article FROM rss_endpoint WHERE id > 0 AND frequence = ? ORDER BY id LIMIT ? ',
      [level, latest_id, newAmount]
    );
    rssDatas = rssDatas.concat(moreUrls);
  }

  // update to center.
  const new_latest_id = rssDatas[rssDatas.length - 1].id;
  updateCenterCheckedArray(level, new_latest_id);

  // return when no data in array, end mission
  if (rssDatas.length === 0) {
    return;
  }

  // check urls and insert only new articles.
  for (let i = 0; i < rssDatas.length; i += 1) {
    // for (let i = 0; i < 1; i += 1) {
    const { id, url, latest_article } = rssDatas[i];
    console.log(`#start format id#`, id);
    try {
      const rawArticles = await checkNewArticle(id, url, latest_article);
      const formatedData = await formatArticles(id, rawArticles);
      await insertArticles(id, formatedData);
    } catch (error) {
      console.error(error);
    }
  }
}

async function checkNewArticle(id, url, latest_article) {
  console.log(`#--------------------[checkNewArticle]#\n`);
  const rawDatas = await rssParser(url);
  if (!rawDatas) {
    console.log(`#failure#`, id);
  }

  // if article title is duplicated from the latest article, stop push.
  const newArticles = [];
  const items = rawDatas.items;
  for (let item of items) {
    if (item.link === latest_article) {
      break;
    }
    newArticles.push(item);
  }
  return newArticles;
}

async function formatArticles(id, rawArticles) {
  console.log(`#--------------------[formatArticles]#\n`);
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
    const rssContent = e.contentSnippet.slice(0, 2000) + '...(更多請到原始頁面觀看)';
    const rssPicture = await xmlGetImage(e.content, e.link);
    const data = [id, rssDate, e.title, e['dc:creator'], rssContent, rssPicture, e.link];

    datas.push(data);
  }
  return datas;
}

async function insertArticles(id, newArticles) {
  console.log(`#--------------------[insertArticles]#\n`);
  console.log(`#get rss beginning id is#`, id);

  if (newArticles.length === 0) {
    console.log(`#no insert needed.#`);
    return;
  }

  // insert model
  const conn = await pool.getConnection();
  try {
    await conn.query('START TRANSACTION;');
    await conn.query('LOCK TABLES rss_data WRITE;');

    // insert db, 5 data per time.
    for (let j = 0; j < newArticles.length; j += 5) {
      console.log(`#inserting#${id}-${j}`);
      const temp = newArticles.slice(j, j + 5);

      await conn.query(
        'INSERT INTO rss_data(endpoint_id, latest_date, title, auther, des, picture, url) VALUES ?',
        [temp]
      );
    }
    await conn.query('UNLOCK TABLES');

    await conn.query('LOCK TABLES rss_endpoint WRITE;');
    const latestArticle = newArticles[0][6];
    console.log(`#latestArticle#`, latestArticle);
    await conn.query('UPDATE rss_endpoint SET latest_article = ? WHERE id = ?', [
      latestArticle,
      id,
    ]);

    await conn.query('COMMIT');
    console.log(`#finish rss id is#`, id);
  } catch (err) {
    console.log(`#--------------------[err]#\n`, err);
    console.log(`#insert error id is#`, id);
    await conn.query('ROLLBACK');
  } finally {
    await conn.query('UNLOCK TABLES');
    await conn.release();
  }
}

function getTodayDate() {
  console.log(`#--------------------[getTodayDate]#\n`);
  const now = new Date();
  const year = now.getFullYear();
  const month = `0${now.getMonth()}`.slice(-2);
  const day = `0${now.getDay()}`.slice(-2);
  const today = `${year}-${month}-${day}`;
  return today;
}

// if xml doesn't have img, crawler from url instead.
async function xmlGetImage(xml, url) {
  console.log(`#--------------------[xmlGetImage]#\n`);
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
  // try crawler

  try {
    // setTimeout(doStuff, 1000);
    const result = await axios({
      method: 'GET',
      url: url,
    });
    const html = result.data;
    const $ = cheerio.load(html);
    photoPath = $('meta[property="og:image"]').attr().content;
    if (photoPath === null || photoPath === '') {
      return;
    } else {
      return photoPath;
    }
  } catch (err) {
    console.log(`#image crawler failure#`);
    return '';
  }
}

async function updateCenterCheckedArray(level, id) {
  console.log(`#--------------------[updateCenterCheckedArray]#\n`);
  const [status] = await pool.query('SELECT * FROM worker_center WHERE id = 1');
  const rss_checked_array = JSON.parse(status[0].latest_rss_checked_array);
  rss_checked_array[level] = id;
  const arrString = JSON.stringify(rss_checked_array);
  await pool.query('UPDATE worker_center SET latest_rss_checked_array=?', [arrString]);
}

async function checkGoogleApiUpdate() {
  const result = await axios({
    method: 'GET',
    url: GOOGLENEWS_API_URL,
    params: { lang: 'zh', country: 'tw' },
    headers: {
      'X-RapidAPI-Host': GOOGLENEWS_API_HOST,
      'X-RapidAPI-Key': GOOGLENEWS_API_KEY,
    },
  });
  console.log(`#--------------------[result]#\n`, result.data);
}

async function checkNewsApiUpdate() {
  const id = 1;
  try {
    const rawNews = await checkNewNews();
    const formatedNews = await formatNews(id, rawNews);
    await insertNews(id, formatedNews);
  } catch (err) {
    console.log(`#--------------------[err]#\n`, err);
  }
}

async function checkNewNews() {
  let news = await newsapi.v2.topHeadlines({
    country: 'tw',
  });
  // let news = await new Promise((res, rej) => {
  //   fs.readFile('./data/api/newsapi_th_tw-all.json', 'utf-8', (err, data) => {
  //     res(JSON.parse(data));
  //   });
  // });

  // check if data is ok
  if (news.status !== 'ok') {
    return;
  }

  const [result] = await pool.query('SELECT latest_article FROM news_endpoint WHERE title = ?', [
    'newsapi',
  ]);

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
  console.log(`#--------------------[]#\n`, rawNews);
  let formatedNews = [];
  for (let n of rawNews) {
    const newsDate = n.publishedAt.slice(0, 10);
    const newsSource = n['source']['name'];
    const temp = [id, newsDate, n.title, newsSource, n.author, n.description, n.urlToImage, n.url];
    formatedNews.push(temp);
  }
  return formatedNews;
}

async function insertNews(id, news) {
  console.log(`#--------------------[insertNews]#\n`);

  if (news.length === 0) {
    console.log(`#no insert needed.#`);
    return;
  }

  // insert model
  const conn = await pool.getConnection();
  try {
    await conn.query('START TRANSACTION;');
    await conn.query('LOCK TABLES news_data WRITE;');

    // insert db, 5 data per time.
    for (let j = 0; j < news.length; j += 5) {
      console.log(`#news inserting#${id}-${j}`);
      const temp = news.slice(j, j + 5);

      await conn.query(
        'INSERT INTO news_data(endpoint_id, latest_date, title, source, auther, des, picture, url) VALUES ?',
        [temp]
      );
    }
    await conn.query('UNLOCK TABLES');

    await conn.query('LOCK TABLES news_endpoint WRITE;');
    const latestArticle = news[0][7];
    console.log(`#latestArticle#`, latestArticle);
    await conn.query('UPDATE news_endpoint SET latest_article = ? WHERE id = ?', [
      latestArticle,
      id,
    ]);
    await conn.query('COMMIT');
    console.log(`#finish news id is#`, id);
  } catch (err) {
    console.log(`#--------------------[err]#\n`, err);
    console.log(`#insert news error id is#`, id);
    await conn.query('ROLLBACK');
  } finally {
    await conn.query('UNLOCK TABLES');
    await conn.release();
  }
}
