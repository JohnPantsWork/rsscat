const Parser = require('rss-parser');
const CONNECT_TIMEOUT = parseInt(process.env.CONNECT_TIMEOUT);

const parser = new Parser({
  timeout: CONNECT_TIMEOUT,
});

async function rssParser(url) {
  try {
    const parserResult = await parser.parseURL(url);
    return parserResult;
  } catch (err) {
    return false;
  }
}

module.exports = { rssParser };
