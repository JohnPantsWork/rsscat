const { jiebaCut } = require('./jieba_test');
const { pool } = require('../util/rdb_mysql');
const fs = require('fs');

// words_tags = array of words
async function td(words_tags) {
  const singleData = {};
  const totalLength = words_tags.length;
  for (let i = 0; i < totalLength; i += 1) {
    if (singleData[words_tags[i]]) {
      singleData[words_tags[i]].highlights += 1 / totalLength;
    } else {
      singleData[words_tags[i]] = {};
      singleData[words_tags[i]].highlights = 1 / totalLength;
    }
  }
  return singleData;
}

// tds = array of tds
async function idf(tds) {
  let dict = {};
  const totalLength = tds.length;
  for (let i = 0; i < tds.length; i += 1) {
    for (const [key, value] of Object.entries(tds[i])) {
      if (dict[key]) {
        dict[key].times += 1;
      } else {
        dict[key] = {};
        dict[key].times = 1;
      }
    }
  }

  let array = {};
  for (const [key, value] of Object.entries(dict)) {
    console.log(`#--------------------[key]#\n`, key);
    console.log(`#[key.times]#\n`, value.times);
    console.log(`#[totalLength]#\n`, totalLength);
    const idf = Math.log(totalLength) - Math.log(value.times);

    array[key] = {};
    array[key].idf = idf;
  }
  return array;
}

// tds = array of tds
// async function idf(tds) {
//   let dict = {};
//   const totalLength = tds.length;
//   for (let i = 0; i < tds.length; i += 1) {
//     for (const [key, value] of Object.entries(tds[i])) {
//       if (dict[key]) {
//         dict[key].times += 1 / totalLength;
//       } else {
//         dict[key] = {};
//         dict[key].times = 1 / totalLength;
//       }
//     }
//   }
//   return dict;
// }

async function a300() {
  const [rawDatas] = await pool.query('SELECT des FROM rss_data WHERE id < 301');

  const tdsArray = [];
  for (let i = 0; i < rawDatas.length; i += 1) {
    const cutResult = await jiebaCut(`${rawDatas[i].des}`);
    const tdResult = await td(cutResult);
    tdsArray.push(tdResult);
  }
  fs.writeFile('./data/tf2.json', JSON.stringify(tdsArray), (err, data) => {
    console.log(`#err#`, err);
  });
  const idfResult = await idf(tdsArray);
  fs.writeFile('./data/idf2.json', JSON.stringify(idfResult), (err, data) => {
    console.log(`#err#`, err);
  });
  // process.exit();
}
a300();
