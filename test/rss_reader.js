const fs = require('fs');
let rawData;
const reader = async (url) => {
  await fs.readFile(url, 'utf8', (err, data) => {
    if (err) {
      console.log(err);
    } else {
      rawData = JSON.parse(data);
      return rawData;
    }
  });
};

console.log(reader('./data/rssData.json'));
