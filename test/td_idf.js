const { jiebaCut } = require('./jieba_test');
const { pool } = require('../util/rdb');
const fs = require('fs');
const { asyncLoopObj } = require('../util/util');

const tagSkipWords = [
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
  'q',
  'r',
  's',
  't',
  'u',
  'v',
  'w',
  'x',
  'y',
  'z',
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
  '!',
  '@',
  '#',
  '$',
  '%',
  '^',
  '&',
  '*',
  '(',
  ')',
  '_',
  '+',
  '=',
  '{',
  '}',
  '[',
  ']',
  ':',
  ';',
  '<',
  '>',
  '?',
  '/',
  '|',
  '\\',
  '~',
  '`',
  '.',
  ',',
  "'",
  '"',
  '　',
  ' ',
  '，',
  '…',
  '、',
  '？',
  '：',
  '．',
  '“',
  '”',
  '。',
  '！',
  '；',
  '《',
  '》',
  '「',
  '」',
  '（',
  '）',
  '－',
  '–',
  '＝',
  '『',
  '』',
  '｜',
  '【',
  '】',
  '\n',
  '\r',
  '\n\r',
  '\r\n',
  '\t',
  '／',
  '’',
  '※',
  '×',
  '・',
  '〈',
  '〉',
  '⋯',
  '＆',
];

// words_tags = array of words
async function td(words_tags) {
  const singleData = {};
  const totalLength = words_tags.length;
  for (let i = 0; i < totalLength; i += 1) {
    if (tagSkipWords.includes(words_tags[i])) {
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
async function idf(tds) {
  let dict = {};
  const totalLength = tds.length;
  for (let i = 0; i < tds.length; i += 1) {
    for (const [key, value] of Object.entries(tds[i])) {
      if (dict[key]) {
        dict[key].times += 1 / totalLength;
      } else {
        dict[key] = {};
        dict[key].times = 1 / totalLength;
      }
    }
  }
  return dict;
}

async function wordAppearCal() {
  const [rawDatas] = await pool.query('SELECT des FROM rss_data WHERE id < 301');

  const tdsArray = [];
  let count = 0;
  for (let i = 0; i < rawDatas.length; i += 1) {
    const cutResult = await jiebaCut(`${rawDatas[i].des}`);
    const tdResult = await td(cutResult);

    await asyncLoopObj(tdResult, async (key) => {
      count += 1;
      console.log(`#count#`, count);
      await pool.query('INSERT INTO tag_info (tag_name,appear_times) VALUES (?,1) ON DUPLICATE KEY UPDATE appear_times = appear_times + 1;', [key]);
    });

    tdsArray.push(tdResult);
  }
  // console.log(`#--------------------[tdsArray]#\n`, tdsArray);
  // fs.writeFile('./data/tf2.json', JSON.stringify(tdsArray), (err, data) => {
  //   console.log(`#err#`, err);
  // });
  // const idfResult = await idf(tdsArray);
  // fs.writeFile('./data/idf2.json', JSON.stringify(idfResult), (err, data) => {
  //   console.log(`#err#`, err);
  // });
  process.exit();
}
wordAppearCal();
