const fs = require('fs');
const { pool } = require('../../util/rdb');

async function inerter() {
  let dataArray = [];
  await fs.readFile('./data/sql/rss_endpoint.tsv', 'utf-8', async (err, data) => {
    const array = data.split('\n');
    console.log(`#--------------------[array]#\n`, array);
    for (let i = 0; i < array.length; i += 1) {
      const tempArr = array[i].split('\t');
      dataArray.push(tempArr);
    }
    console.log(`#--------------------[dataArray]#\n`, dataArray);
    await pool.query('INSERT INTO rss_endpoint(title,frequence,url) VALUES ?', [dataArray]);
    console.log(`#finish#`);
  });
}
inerter();
