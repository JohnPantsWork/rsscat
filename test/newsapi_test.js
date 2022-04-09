require('dotenv').config();
const { NEWS_API_KEY } = process.env;
const NewsAPI = require('newsapi');
const newsapi = new NewsAPI(NEWS_API_KEY);
const fs = require('fs');

// To query /v2/top-headlines
// All options passed to topHeadlines are optional, but you need to include at least one of them
newsapi.v2
  .topHeadlines({
    // sources: 'bbc-news,the-verge',
    // q: 'bitcoin',
    // category: 'business',
    // language: 'en',
    country: 'tw',
  })
  .then((response) => {
    const rawdata = JSON.stringify(response);
    fs.appendFile('data/newsapi_th_demo.json', rawdata, (err) => {});
    console.log(response);
    /*
    {
      status: "ok",
      articles: [...]
    }
  */
  });

// To query /v2/everything
// You must include at least one q, source, or domain
// newsapi.v2
//   .everything({
//     // q: 'bitcoin',
//     // sources: 'bbc-news,the-verge',
//     // domains: 'bbc.co.uk, techcrunch.com',
//     from: '2022-4-4',
//     to: '2022-4-4',
//     // language: 'en',
//     // sortBy: 'relevancy',
//     // page: 2,
//   })
//   .then((response) => {
//     const rawdata = JSON.stringify(response);
//     fs.appendFile('data/newsapi_et_demo.json', rawdata, (err) => {});
//     console.log(response);
//     /*
//     {
//       status: "ok",
//       articles: [...]
//     }
//   */
//   });

// To query sources
// All options are optional
// newsapi.v2
//   .sources({
//     category: 'technology',
//     // language: 'zh',
//     country: 'tw',
//   })
//   .then((response) => {
//     const rawdata = JSON.stringify(response);
//     fs.appendFile('data/newsapi_s_demo.json', rawdata, (err) => {});
//     console.log(response);
//     /*
//     {
//       status: "ok",
//       sources: [...]
//     }
//   */
//   });
