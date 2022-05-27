const crawlerService = require('../service/crawler_service');
const NEWS_TYPE = 'news';
const RSS_TYPE = 'rss';

const crawlerController = {
    checkRssUpdate: async function (newMission) {
        const { rssUrl } = newMission;

        for (let i = 0; i < rssUrl.length; i += 1) {
            const { id, url, latest_article } = rssUrl[i];

            const rawArticles = await crawlerService.checkNewArticle(id, url, latest_article);
            if (!rawArticles) {
                continue;
            }

            const formatedData = await crawlerService.formatArticles(id, rawArticles);
            if (formatedData === undefined) {
                continue;
            }

            const formatedDataWithTagging = await crawlerService.articleTagging(
                formatedData,
                RSS_TYPE
            );
            await crawlerService.insertArticles(id, formatedDataWithTagging);
        }
    },

    checkNewsApiUpdate: async function () {
        const rawNews = await crawlerService.checkNewNews();
        const formatedNews = await crawlerService.formatNews(rawNews);
        const formatedDataWithTagging = await crawlerService.articleTagging(
            formatedNews,
            NEWS_TYPE
        );
        await crawlerService.insertNews(formatedDataWithTagging);
    },
};

module.exports = crawlerController;
