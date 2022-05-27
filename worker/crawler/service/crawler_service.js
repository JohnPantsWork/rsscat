require('dotenv').config();
const { NEWS_API_KEY, CKIP_URL } = process.env;
const CONNECT_TIMEOUT = parseInt(process.env.CONNECT_TIMEOUT);
const ARTICLES_LIMIT = parseInt(process.env.ARTICLES_LIMIT);
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
    selectCenterStatus,
    selectLatestNewsArticle,
    selectIdFromTagName,
    selectTagAppearTime,
    updateWorkerCenterRssChecked,
} = require('../model/crawler_model');

const RSS_DES_INDEX = 4;
const NEWS_DES_INDEX = 5;
const MAX_WORDS_LIMIT = 2000;
const TAGS_PER_ARTICLES = 2000;
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

    checkNewArticle: async function (id, url, latest_article) {
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
        await insertArticles(id, newArticles);
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

    updateCenterCheckedArray: async function (level, id) {
        const status = await selectCenterStatus();

        const rss_checked_array = JSON.parse(status[0].latest_rss_checked_array);
        rss_checked_array[level] = id;
        const arrString = JSON.stringify(rss_checked_array);
        await updateWorkerCenterRssChecked(arrString);
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
        for (let i = 0; i < rawNews.length && i < ARTICLES_LIMIT; i += 1) {
            const n = rawNews[i];
            const newsDate = n.publishedAt.slice(0, 10);
            const newsSource = n['source']['name'];
            const temp = [
                NEWS_API_ID,
                newsDate,
                n.title,
                newsSource,
                n.author,
                n.description,
                n.urlToImage,
                n.url,
            ];
            formatedNews.push(temp);
        }
        return formatedNews;
    },

    insertNews: async function (news) {
        if (news.length === 0) {
            return;
        }
        await insertNews(news);
    },

    articleTagging: async function (formatedData, type) {
        let des_index;
        switch (type) {
            case 'rss':
                des_index = RSS_DES_INDEX;
                break;
            case 'news':
                des_index = NEWS_DES_INDEX;
                break;
            default:
                break;
        }

        const formatedDataWithTagging = [];
        for (let i = 0; i < formatedData.length; i += 1) {
            const des = formatedData[i][des_index];
            const cutWords = await this.ckip(des);
            const tfResult = await this.tf(cutWords);
            const insert_tag_info = await objKeyArray(tfResult);
            for (let j = 0; j < insert_tag_info.length; j += 1) {
                await insertTagInfo(insert_tag_info[j]);
            }

            const topTags = await this.tf_idf(tfResult, TAGS_PER_ARTICLES);

            if (topTags.length < TAGS_PER_ARTICLES) {
                continue;
            }

            const tags = topTags.map((e) => {
                return e[0];
            });
            const rawTagIds = await this.tagNameToId(tags);
            const tagIds = arrayObjValue(rawTagIds);

            formatedDataWithTagging.push(formatedData[i].concat(tagIds));
        }
        return formatedDataWithTagging;
    },

    ckip: async function (articleDescription) {
        const result = await ajax.params({
            method: 'POST',
            url: `${CKIP_URL}`,
            data: { raw_words: articleDescription },
        });
        const wordsWithPos = result.data.data.pos;
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
        let idfDict = {};
        idfs.map((obj) => {
            if (!dataObj[obj.tag_name] || !dataObj[obj.tag_name].highlights) {
                return;
            }
            const percent = 10000 * (1 / obj.appear_times) * dataObj[obj.tag_name].highlights;
            idfDict[obj.tag_name] = percent;
        });
        return topValues(idfDict, amount);
    },
};

module.exports = crawlerService;
