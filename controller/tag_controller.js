const internalMessages = require('../data/internalMessages');
const tagService = require('../service/tag_service');

// TODO: 完全刪除使用者喜歡文章的所有紀錄
const deleteRecord = async (req, res) => {
    const { userData } = req.body;
    await tagService.deleteAllUserRecord(userData);
    return res.status(200).json({ data: internalMessages[2603] });
};

// TODO: 回傳使用者的標籤狀態
const getUserTag = async (req, res) => {
    const { userData } = req.body;
    const likedTagNames = await tagService.getTagNames(userData.likeTags);
    const dislikeTagNames = await tagService.getDislikedTagNames(userData);
    return res
        .status(200)
        .json({ data: { likeTags: likedTagNames, dislikeTags: dislikeTagNames } });
};

// TODO: 獲得使用者喜歡的紀錄
const getRecord = async (req, res) => {
    const { userData } = req.body;
    const selectResult = await tagService.selectUserRecord(userData.userId);
    return res.status(200).json({ data: selectResult });
};

// TODO: 更新使用者的標籤
const patchUserTag = async (req, res) => {
    const { likedTags, dislikedTags, associateLevel = null, userData } = req.body;

    let likeTags;
    if (likedTags) {
        likeTags = await tagService.patchAddTags(likedTags, userData);
    }
    if (dislikedTags) {
        likeTags = await tagService.patchDeleteTags(dislikedTags, userData);
    }
    if (associateLevel !== null) {
        likeTags = await tagService.patchDeleteAllTags(userData);
    }

    return res.status(200).json({ data: { likeTags: likeTags } });
};

// TODO: 刪除使用者喜歡文章的紀錄
const patchRecord = async (req, res) => {
    const { userData, dataId, datatypeId } = req.body;
    await tagService.deleteUserRecord(userData.userId, dataId, datatypeId);
    return res.status(200).json({ data: { message: internalMessages[2602] } });
};

// TODO: 新增使用者喜歡文章的紀錄
const postRecord = async (req, res) => {
    const { tag_id_arr, data_id, datatype_id, userData } = req.body || null;
    await tagService.insertMultiRecoeds(userData.userId, tag_id_arr, data_id, datatype_id);
    return res.status(200).json({ data: { message: internalMessages[2601] } });
};

module.exports = {
    getUserTag,
    patchUserTag,
    getRecord,
    postRecord,
    patchRecord,
    deleteRecord,
};
