const { rawData } = require('../data/rss2');
const fs = require('fs');

const Parser = require('rss-parser');
let rssParser = new Parser();

async function rssUrlParser(url) {
  const parserResult = await rssParser.parseURL(url);
  console.log(`#--------------------[parserResult]#\n`, parserResult);
  return parserResult;
}

async function rssFs() {
  const data = await rssUrlParser('https://blow.streetvoice.com/feed/');
  fs.writeFile('./data/rssData.json', JSON.stringify(data), (err) => {
    if (err) console.log(err);
  });
}
