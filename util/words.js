const nodejieba = require('nodejieba');
const { objKeyArray, topKeys, topValues, asyncLoopObj } = require('./util');
const { skipWords } = require('../data/chinese/stopwords_zh.js');
const { pool } = require('../util/rdb');

nodejieba.load({
  dict: './data/chinese/dictionary_zh.txt',
  stopWordDict: './data/chinese/stopwords_zh',
});

async function jiebaCut(raw_words) {
  const cuttedWords = await nodejieba.cut(raw_words);
  return cuttedWords;
}

async function jiebaTag(raw_words) {
  const cuttedWords = await nodejieba.tag(raw_words);
  return cuttedWords;
}

async function td(words_tags) {
  const singleData = {};
  const totalLength = words_tags.length;
  for (let i = 0; i < totalLength; i += 1) {
    if (skipWords.includes(words_tags[i])) {
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

// tds = [{td()},{td()}]
// use only when idf need renew.
// async function idf(tds) {
//   let dict = {};
//   const totalLength = tds.length;
//   for (let i = 0; i < tds.length; i += 1) {
//     for (const [key, value] of Object.entries(tds[i])) {
//       if (dict[key]) {
//         dict[key].times += 1;
//       } else {
//         dict[key] = {};
//         dict[key].times = 1;
//       }
//     }
//   }
//   let idfDict = {};
//   for (const [key, value] of Object.entries(dict)) {
//     const idf = Math.log(totalLength) - Math.log(value.times);

//     idfDict[key] = {};
//     idfDict[key].idf = idf;
//   }
//   return idfDict;
// }

// dataObj = {td}
async function td_idf(dataObj, amount) {
  const keysArray = await Object.keys(dataObj);
  const [idfs] = await pool.query('SELECT tag_name,appear_times FROM tag_info WHERE tag_name IN (?)', [keysArray]);
  let idfDict = {};
  idfs.map((obj) => {
    console.log(`#--------------------[obj]#\n`, obj);
    if (dataObj[obj.tag_name].highlights === undefined) {
      return;
    }
    const percent = 10000 * (1 / obj.appear_times) * dataObj[obj.tag_name].highlights;
    idfDict[obj.tag_name] = percent;
  });
  return topValues(idfDict, amount);
}

// use to increase tag_info appeartime
// async function wordAppearCal() {
//   const [rawDatas] = await pool.query('SELECT des FROM rss_data WHERE id <= 990');
//   const tdsArray = [];
//   let count = 0;
//   for (let i = 0; i < rawDatas.length; i += 1) {
//     const cutResult = await jiebaCut(`${rawDatas[i].des}`);
//     const tdResult = await td(cutResult);
//     await asyncLoopObj(tdResult, async (key) => {
//       count += 1;
//       console.log(`#count#`, count);
//       await pool.query('INSERT INTO tag_info (tag_name,appear_times) VALUES (?,1) ON DUPLICATE KEY UPDATE appear_times = appear_times + 1;', [key]);
//     });
//     // tdsArray.push(tdResult);
//   }
//   process.exit();
// }
// wordAppearCal();

// async function exe() {
//   const [rawDatas] = await pool.query('SELECT title,des FROM rss_data WHERE id <= 1');
//   for (let i = 0; i < rawDatas.length; i += 1) {
//     const rawData = rawDatas[i];
//     console.log(`#--------------------[rawData]#\n`, rawData);
//     const cutDatas = await jiebaCut(rawData.des);
//     console.log(`#--------------------[rawData]#\n`, cutDatas);
//     const tdR = await td(cutDatas);
//     console.log(`#--------------------[tdR]#\n`, tdR);
//     const td_idfR = await td_idf(tdR, 3);
//     console.log(`#--------------------[td_idfR]#\n`, td_idfR);
//     // await pool.query('UPDATE rss_data SET tag_id_1 = ?, tag_id_2 = ?, tag_id_3 = ? WHERE des = ?');
//   }
//   process.exit();
// }
// exe();

const articleTopTags = async (article, amount) => {
  const cutDatas = await jiebaCut(article);
  const tdR = await td(cutDatas);
  const td_idfR = await td_idf(tdR, amount);
  return td_idfR;
};

const tagNameToId = async (tagNames) => {
  const [result] = await pool.query('SELECT id FROM tag_info WHERE tag_name in (?)', [tagNames]);
  return result;
};

module.exports = { jiebaCut, jiebaTag, td, td_idf, articleTopTags, tagNameToId };
