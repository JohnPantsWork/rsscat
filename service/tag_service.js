const { arrayObjValue, getNow } = require('../util/utils');
const cache = require('../util/cache');
const {
    inserMultiRecordModel,
    selectTagNamesModel,
    selectUserRecordModel,
    deleteUserRecordModel,
    deleteAllUserRecordModel,
} = require('../model/tag_model');
const { wrapModel } = require('../util/modelWrappers');

const tagService = {
    deleteTags: async function (dislikedTags, userData) {
        userData.likeTags = userData.likeTags.filter((tag) => {
            return dislikedTags.indexOf(tag) === -1;
        });
        await cache.set(`user:${userData.userId}`, JSON.stringify(userData));
        return this.getTagNames(userData.likeTags);
    },
    deleteAllTags: async function (userData) {
        const selectResult = await wrapModel(selectUserRecordModel, [userData.userId]);
        const values = arrayObjValue(selectResult);
        userData.likeTags = userData.likeTags.filter((tag) => {
            return values.indexOf(tag) !== -1;
        });
        await cache.set(`user:${userData.userId}`, JSON.stringify(userData));
        return this.getTagNames(userData.likeTags);
    },
    deleteUserRecord: async function (userId, dataId, datatypeId) {
        await wrapModel(deleteUserRecordModel, [userId, dataId, datatypeId]);
    },
    deleteAllUserRecord: async function (userData) {
        await wrapModel(deleteAllUserRecordModel, [userData.userId]);
        userData.likeTags = [];
        await cache.set(`user:${userData.userId}`, JSON.stringify(userData));
    },
    getTagNames: async function (tags) {
        return await wrapModel(selectTagNamesModel, [tags]);
    },
    getDislikedTagNames: async function (userData) {
        const selectResult = await wrapModel(selectUserRecordModel, [userData.userId]);
        const values = arrayObjValue(selectResult);
        let dislikeTags = values.filter((tag) => {
            return userData.likeTags.indexOf(tag) === -1;
        });
        return await tagService.getTagNames(dislikeTags);
    },
    getUserRecord: async function (userId) {
        return await wrapModel(selectUserRecordModel, [userId]);
    },
    patchTags: async function (likedTags, userData) {
        const temp = likedTags.concat(userData.likeTags);
        userData.likeTags = [...new Set(temp)];
        await cache.set(`user:${userData.userId}`, JSON.stringify(userData));
        return await wrapModel(selectTagNamesModel, [userData.likeTags]);
    },
    postMultiRecoeds: async function (userId, tag_id_arr, data_id, datatype_id) {
        await wrapModel(inserMultiRecordModel, [
            userId,
            tag_id_arr,
            data_id,
            datatype_id,
            getNow().date,
        ]);
    },
};

module.exports = tagService;
