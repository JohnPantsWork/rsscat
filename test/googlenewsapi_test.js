require('dotenv').config();
const { GOOGLENEWS_API_URL, GOOGLENEWS_API_HOST, GOOGLENEWS_API_KEY } = process.env;
const fs = require('fs');

const axios = require('axios');

const options = {
  method: 'GET',
  url: GOOGLENEWS_API_URL,
  params: { lang: 'zh', country: 'tw' },
  headers: {
    'X-RapidAPI-Host': GOOGLENEWS_API_HOST,
    'X-RapidAPI-Key': GOOGLENEWS_API_KEY,
  },
};

axios
  .request(options)
  .then(function (response) {
    console.log(response.data);
    const rawdata = JSON.stringify(response.data);
    fs.appendFile('data/googlenewsapi_th_demo.json', rawdata, (err) => {});
  })
  .catch(function (error) {
    console.error(error);
  });
