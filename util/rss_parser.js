const Parser = require('rss-parser');
const axios = require('axios');

const parser = new Parser();

async function rssParser(url) {
  try {
    const parserResult = await parser.parseURL(url);
    return parserResult;
  } catch (err) {
    return false;
  }
}

module.exports = { rssParser };
