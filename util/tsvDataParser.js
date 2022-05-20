const fs = require('fs');
const { pool } = require('./rdb');

const dictPath = './data/chinese/dictionary_zh.tsv';
const endPath = './data/sql/rss_endpoint.tsv';

// insert dictionary into rdb database.
async function insertDict() {
    let dataArray = [];
    await fs.readFile(dictPath, 'utf-8', async (err, data) => {
        // split with \n and space
        const array = data.split('\n');
        for (let i = 0; i < array.length; i += 1) {
            const tempArr = array[i].split(' ');
            dataArray.push(tempArr.slice(0, 2));
        }
        // slice insert data with 200 words a set.
        for (let i = 0; i < dataArray.length; i += 200) {
            const temp = dataArray.slice(i, i + 200);
            await pool.query('INSERT INTO tag_info(tag_name,appear_times) VALUES ? ON DUPLICATE KEY UPDATE appear_times+=appear_times', [temp]);
        }
        console.info(`#dict insert finish#`);
    });
}

async function insertEndpoint() {
    let dataArray = [];
    await fs.readFile(endPath, 'utf-8', async (err, data) => {
        const array = data.split('\n');
        for (let i = 0; i < array.length; i += 1) {
            const tempArr = array[i].split('\t');
            dataArray.push(tempArr);
        }
        await pool.query('INSERT INTO rss_endpoint(title,frequence,url) VALUES ?', [dataArray]);
        console.info(`#endpoints insert finish#`);
    });
}
insertDict();
insertEndpoint();
