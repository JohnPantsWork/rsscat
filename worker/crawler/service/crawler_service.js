require('dotenv').config();
const { NEWS_API_KEY, CKIP_URL } = process.env;
const CONNECT_TIMEOUT = parseInt(process.env.CONNECT_TIMEOUT);
const ARTICLES_LIMIT = parseInt(process.env.ARTICLES_LIMIT);
const ARTICLES_NEWS_LIMIT = parseInt(process.env.ARTICLES_NEWS_LIMIT);
const ajax = require('../util/ajax');
const cheerio = require('cheerio');
const NewsAPI = require('newsapi');
const newsapi = new NewsAPI(NEWS_API_KEY);
const { rssParser } = require('../util/rssParser');
const { arrayObjValue, objKeyArray, topValues } = require('../util/utils');
const { skip_part } = require('../data/chinese/skip_part');
const { skipWords } = require('../data/chinese/stopwords_zh.js');
const {
    insertArticles,
    insertNews,
    insertTagInfo,
    selectRssUrls,
    selectLatestRssArticle,
    selectLatestNewsArticle,
    selectIdFromTagName,
    selectTagAppearTime,
    selectAllArticlesAmount,
} = require('../model/crawler_model');

const MAX_WORDS_LIMIT = 2000;
const TAGS_PER_ARTICLES = 3;
const NEWS_API_ID = 1;

const crawlerService = {
    getRssEndpoints: async function (latest_id, level, amount) {
        let rssEndpoints = await selectRssUrls(latest_id, level, amount);

        if (rssEndpoints.length < amount) {
            const newAmount = amount - rssEndpoints.length;
            const [moreUrls] = await selectRssUrls(0, level, newAmount); //start from 0
            rssEndpoints = rssEndpoints.concat(moreUrls);
        }
        return rssEndpoints;
    },

    selectLatestRssArticle: async function (id) {
        const result = await selectLatestRssArticle(id);
        return result[0].latest_article;
    },

    checkNewArticle: async function (id, url) {
        const latest_article = this.selectLatestRssArticle(id);
        const rawDatas = await rssParser(url);
        if (!rawDatas) {
            return false;
        }
        const newArticles = [];
        const items = rawDatas.items;
        for (let i = 0; i < items.length && i < ARTICLES_LIMIT; i += 1) {
            if (items[i].link === latest_article) {
                break;
            }
            newArticles.push(items[i]);
        }
        return newArticles;
    },

    formatArticles: async function (id, rawArticles) {
        const today = this.getTodayDate();
        const datas = [];
        const checkDuplicate = new Set();
        for (let j = 0; j < rawArticles.length; j += 1) {
            const rawArticle = rawArticles[j];
            const beforeSize = checkDuplicate.size;
            checkDuplicate.add(rawArticle.title);
            if (beforeSize === checkDuplicate.size) {
                return;
            }
            // check if title, contentSnippet or link is not available
            if (!rawArticle.title || !rawArticle.contentSnippet || !rawArticle.link) {
                return;
            }
            const rssDate = rawArticle.isoDate ? rawArticle.isoDate.slice(0, 10) : today;
            const rssContent =
                rawArticle.contentSnippet.length > MAX_WORDS_LIMIT
                    ? rawArticle.contentSnippet.slice(0, MAX_WORDS_LIMIT)
                    : rawArticle.contentSnippet;
            const rssPicture = await this.xmlGetImage(rawArticle.content, rawArticle.link);
            // const data = [id, rssDate, e.title, e['dc:creator'], rssContent, rssPicture, e.link];
            const rssObj = {
                id: id,
                date: rssDate,
                title: rawArticle.title,
                creator: rawArticle['dc:creator'],
                content: rssContent,
                picture: rssPicture,
                link: rawArticle.link,
            };
            datas.push(rssObj);
        }
        return datas;
    },

    insertArticles: async function (id, newArticles) {
        if (newArticles.length === 0) {
            return;
        }
        // insert model
        const articlesArray = newArticles.map((article) => {
            return [
                article.id,
                article.date,
                article.title,
                article.creator,
                article.content,
                article.picture,
                article.link,
                article.tags[0],
                article.tags[1],
                article.tags[2],
            ];
        });

        await insertArticles(id, articlesArray, newArticles[0].link);
    },

    insertNews: async function (newArticles) {
        if (newArticles.length === 0) {
            return;
        }

        const articlesArray = newArticles.map((article) => {
            return [
                article.id,
                article.date,
                article.title,
                article.source,
                article.creator,
                article.content,
                article.picture,
                article.link,
                article.tags[0],
                article.tags[1],
                article.tags[2],
            ];
        });
        const latestArticle = newArticles[0].link;
        await insertNews(NEWS_API_ID, articlesArray, latestArticle);
    },

    // if xml doesn't have img, crawler from url instead.
    xmlGetImage: async function (xml, url) {
        const tempArr = xml.split('"');
        let photoPath;
        for (let i = 0; i < tempArr.length; i += 1) {
            const temp = tempArr[i];
            if (temp.includes('.jpg') || temp.includes('.jpeg') || temp.includes('.png')) {
                if (temp.includes('http')) {
                    photoPath = temp;
                    return photoPath;
                }
            }
        }

        // if articles doesn't have any image in it, crawl from website.
        try {
            const result = await ajax.params({
                method: 'GET',
                url: url,
                timeout: CONNECT_TIMEOUT,
            });

            const $ = cheerio.load(result.data);
            photoPath = $('meta[property="og:image"]').attr().content;

            if (photoPath === null) {
                return '';
            } else {
                return photoPath;
            }
        } catch (err) {
            return '';
        }
    },

    checkNewNews: async function () {
        let news = await newsapi.v2.topHeadlines({
            country: 'tw',
        });
        if (news.status !== 'ok') {
            return;
        }
        const result = await selectLatestNewsArticle();

        const latest_article = result[0].latest_article;
        let rawNews = [];
        for (let n of news.articles) {
            if (n.url === latest_article) {
                break;
            }
            rawNews.push(n);
        }
        return rawNews;
    },

    formatNews: async function (rawNews) {
        let formatedNews = [];
        for (let i = 0; i < rawNews.length && i < ARTICLES_NEWS_LIMIT; i += 1) {
            const news = rawNews[i];
            const newsDate = news.publishedAt.slice(0, 10);
            const newsSource = news['source']['name'];
            const newsObj = {
                id: NEWS_API_ID,
                date: newsDate,
                title: news.title,
                source: newsSource,
                creator: news.author,
                content: news.description,
                picture: news.urlToImage,
                link: news.url,
            };
            formatedNews.push(newsObj);
        }
        return formatedNews;
    },

    articleTagging: async function (formatedData) {
        const formatedDataWithTagging = [];
        for (let i = 0; i < formatedData.length; i += 1) {
            const cutWords = await this.ckip(formatedData[i].content);
            const tfResult = await this.tf(cutWords);

            // save tags into the tag_info tag to count the tag appear_times
            const insert_tag_info = await objKeyArray(tfResult);
            for (let j = 0; j < insert_tag_info.length; j += 1) {
                await insertTagInfo(insert_tag_info[j]);
            }

            // select top tags by idf, if tag's amount lower than TAGS_PER_ARTICLES, skip this tagging sequence.
            const topTags = await this.tf_idf(tfResult, TAGS_PER_ARTICLES);
            if (topTags.length < TAGS_PER_ARTICLES) {
                continue;
            }

            const tags = topTags.map((e) => {
                return e[0];
            });

            const rawTagIds = await this.tagNameToId(tags);
            formatedData[i]['tags'] = arrayObjValue(rawTagIds);
            formatedDataWithTagging.push(formatedData[i]);
        }
        return formatedDataWithTagging;
    },

    ckip: async function (articleDescription) {
        const result = await ajax.params({
            method: 'POST',
            url: `${CKIP_URL}`,
            data: { raw_words: articleDescription },
        });
        const wordsWithPos = result.data.pos;
        const splitedPos = wordsWithPos.split('),');
        const filteredPos = splitedPos.filter((pos) => {
            const [a, b] = pos.split('(');
            if (skip_part.indexOf(b) === -1) {
                return a;
            }
        });
        const keyPos = filteredPos.map((pos) => {
            return pos.split('(')[0];
        });
        return keyPos;
    },

    getTodayDate: async function () {
        const now = new Date();
        const year = now.getFullYear();
        const month = `0${now.getMonth()}`.slice(-2);
        const day = `0${now.getDay()}`.slice(-2);
        const today = `${year}-${month}-${day}`;
        return today;
    },

    tagNameToId: async function (tagNames) {
        return await selectIdFromTagName(tagNames);
    },

    tf: async function (words_tags) {
        const singleData = {};
        const totalLength = words_tags.length;
        for (let i = 0; i < totalLength; i += 1) {
            if (words_tags[i].length > 16 || skipWords.includes(words_tags[i])) {
                continue;
            }
            if (singleData[words_tags[i]]) {
                singleData[words_tags[i]].highlights += 1 / totalLength;
            } else {
                singleData[words_tags[i]] = {};
                singleData[words_tags[i]].highlights = 1 / totalLength;
            }
        }
        return singleData;
    },

    tf_idf: async function (dataObj, amount) {
        const keysArray = await Object.keys(dataObj);
        const idfs = await selectTagAppearTime(keysArray);
        const allArticlesAmount = await selectAllArticlesAmount();
        let idfDict = {};
        idfs.map((obj) => {
            if (!dataObj[obj.tag_name] || !dataObj[obj.tag_name].highlights) {
                return;
            }
            const percent = Math.log10(
                (allArticlesAmount / obj.appear_times) * dataObj[obj.tag_name].highlights
            );
            idfDict[obj.tag_name] = percent;
        });
        return topValues(idfDict, amount);
    },
};

module.exports = crawlerService;
