// npm package
require('dotenv').config();

var AWS = require('aws-sdk');
var sqs = new AWS.SQS();
const { QUEUE_URL } = process.env;

// internal package
const { pool } = require('./util/rdb');
const {
    checkNewArticle,
    formatArticles,
    insertArticles,
    updateCenterCheckedArray,
    checkNewNews,
    formatNews,
    insertNews,
    articleTagging,
} = require('./model/model');

const newApiId = 1; // only one source.

// exports.handler = async function (event, context) {
//     var params = {
//         AttributeNames: ['SentTimestamp'],
//         MaxNumberOfMessages: 10,
//         MessageAttributeNames: ['All'],
//         QueueUrl: QUEUE_URL,
//         VisibilityTimeout: 20,
//         WaitTimeSeconds: 0,
//     };

//     let queueRes = await sqs.receiveMessage(params).promise();

//     var deleteParams = {
//         QueueUrl: QUEUE_URL,
//         ReceiptHandle: queueRes.Messages[0].ReceiptHandle,
//     };

//     var removedMessage = await sqs.deleteMessage(deleteParams).promise();

//     return 'Working successfully';
// };

async function checkMission() {
    // const nextMission = await cache.brpop('missions', 1000);
    if (nextMission === undefined || nextMission === null) {
        return null;
    }
    const newM = await JSON.parse(nextMission[1]);

    switch (newM.mission) {
        case 'checkRssUpdate':
            const { latest_id, amount, level } = newM;
            await checkRssUpdate(latest_id, amount, level);
            break;
        case 'checkNewsApiUpdate':
            await checkNewsApiUpdate();
            break;
        case 'checkGoogleApiUpdate':
            await checkGoogleApiUpdate();
            break;
        default:
            break;
    }
}

// functions

async function checkRssUpdate(latest_id, amount, level) {
    let [rssEndpoints] = await pool.query(
        'SELECT id,url,frequence,latest_article FROM rss_endpoint WHERE id > ? AND frequence = ? ORDER BY id LIMIT ? ',
        [latest_id, level, amount]
    );
    if (rssEndpoints.length < amount) {
        const newAmount = amount - rssEndpoints.length;
        const [moreUrls] = await pool.query(
            'SELECT id,url,frequence,latest_article FROM rss_endpoint WHERE id > 0 AND frequence = ? ORDER BY id LIMIT ? ',
            [level, newAmount]
        );
        rssEndpoints = rssEndpoints.concat(moreUrls);
    }

    if (rssEndpoints.length === 0) {
        return;
    }

    const new_latest_id = rssEndpoints[rssEndpoints.length - 1].id;
    updateCenterCheckedArray(level, new_latest_id);

    for (let i = 0; i < rssEndpoints.length; i += 1) {
        const { id, url, latest_article } = rssEndpoints[i];
        try {
            const rawArticles = await checkNewArticle(id, url, latest_article);
            if (!rawArticles) {
                continue;
            }

            const formatedData = await formatArticles(id, rawArticles);
            if (formatedData === undefined) {
                continue;
            }

            const formatedDataWithTagging = await articleTagging(formatedData, 'rss');
            await insertArticles(id, formatedDataWithTagging);
        } catch (err) {
            throw new Error(err);
        }
    }
}

async function checkNewsApiUpdate() {
    try {
        const rawNews = await checkNewNews();
        const formatedNews = await formatNews(newApiId, rawNews);
        const formatedDataWithTagging = await articleTagging(formatedNews, 'news');
        await insertNews(newApiId, formatedDataWithTagging);
    } catch (err) {
        throw new Error(err);
    }
}
