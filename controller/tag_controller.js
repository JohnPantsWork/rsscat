const internalMessages = require('../data/internalMessages');
const tagService = require('../service/tag_service');

const deleteRecord = async (req, res) => {
    const { userData } = req.body;
    await tagService.deleteAllUserRecord(userData);
    return res.status(200).json({ data: internalMessages[2603] });
};

const getUserTag = async (req, res) => {
    const { userData } = req.body;
    const likedTagNames = await tagService.getTagNames(userData.likeTags);
    const dislikeTagNames = await tagService.getDislikedTagNames(userData);
    return res
        .status(200)
        .json({ data: { likeTags: likedTagNames, dislikeTags: dislikeTagNames } });
};

const getRecord = async (req, res) => {
    const { userData } = req.body;
    const selectResult = await tagService.getUserRecord(userData.userId);
    return res.status(200).json({ data: selectResult });
};

const patchUserTag = async (req, res) => {
    const { likedTags, dislikedTags, associateLevel = null, userData } = req.body;

    let likeTags;
    if (likedTags) {
        likeTags = await tagService.patchTags(likedTags, userData);
    }
    if (dislikedTags) {
        likeTags = await tagService.deleteTags(dislikedTags, userData);
    }
    if (associateLevel !== null) {
        likeTags = await tagService.deleteAllTags(userData);
    }

    return res.status(200).json({ data: { likeTags: likeTags } });
};

const patchRecord = async (req, res) => {
    const { userData, dataId, datatypeId } = req.body;
    await tagService.deleteUserRecord(userData.userId, dataId, datatypeId);
    return res.status(200).json({ data: { message: internalMessages[2602] } });
};

const postRecord = async (req, res) => {
    const { tag_id_arr, data_id, datatype_id, userData } = req.body || null;
    await tagService.postMultiRecoeds(userData.userId, tag_id_arr, data_id, datatype_id);
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
