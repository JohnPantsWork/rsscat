const crawlerService = require('../service/crawler_service');
const NEWS_TYPE = 'news';
const RSS_TYPE = 'rss';

const crawlerController = {
    checkRssUpdate: async function (newMission) {
        const { id, url } = newMission;
        console.info(`rssmission start, id is `, id);
        console.info(`#rss checking...#`);

        const rawArticles = await crawlerService.checkNewArticle(id, url);
        if (rawArticles.length === 0) {
            console.info('no new articles.');
            return;
        }

        const formatedData = await crawlerService.formatArticles(id, rawArticles);
        if (formatedData === undefined) {
            console.info('formatedData failure.');
            return;
        }
        console.info('formated articles success, tagging...');

        const formatedDataWithTags = await crawlerService.articleTagging(formatedData, RSS_TYPE);
        console.info('tagging articles success, inserting...');
        await crawlerService.insertArticles(id, formatedDataWithTags);
    },
    checkNewsApiUpdate: async function () {
        console.info(`NewsApi start`);
        console.info(`#news checking...#`);

        const rawNews = await crawlerService.checkNewNews();
        if (!rawNews) {
            console.info('no new articles.');
            return;
        }
        console.info('get new news, formating...');

        const formatedNews = await crawlerService.formatNews(rawNews);
        if (formatedNews === undefined) {
            console.info('formatedData failure.');
            return;
        }
        console.info('formated articles success, tagging...');

        const formatedDataWithTagging = await crawlerService.articleTagging(
            formatedNews,
            NEWS_TYPE
        );

        await crawlerService.insertNews(formatedDataWithTagging);
    },
};

module.exports = crawlerController;
