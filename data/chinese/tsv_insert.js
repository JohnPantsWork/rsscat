const fs = require('fs');
const { pool } = require('../../util/rdb');

async function inerter() {
  let dataArray = [];
  await fs.readFile('./data/chinese/dictionary_zh.txt', 'utf-8', async (err, data) => {
    const array = data.split('\n');
    for (let i = 0; i < array.length; i += 1) {
      const tempArr = array[i].split(' ');
      dataArray.push(tempArr.slice(0, 2));
    }
    console.log(`#--------------------[dataArray]#\n`, dataArray);
    for (let i = 0; i < dataArray.length; i += 200) {
      const temp = dataArray.slice(i, i + 200);
      await pool.query('INSERT INTO tag_info(tag_name,appear_times) VALUES ? ON DUPLICATE KEY UPDATE appear_times+=appear_times', [temp]);
    }
    console.log(`#finish#`);
  });
}
inerter();
