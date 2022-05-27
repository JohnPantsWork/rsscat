const internalMessages = require('../data/internalMessages');
const catService = require('../service/cat_service');
const userService = require('../service/user_service');

// TODO: 獲取使用者的最後登入時間與貓咪設定
const getCat = async (req, res) => {
    const { userData } = req.body;
    const lastLoginDate = await userService.selectUserLoginDate(userData.userId);
    return res.status(200).json({
        data: {
            latest_login: JSON.stringify(lastLoginDate),
            latest_style: userData.catStyle,
        },
    });
};

// TODO: 獲取貓咪商店狀態與使用者擁有的金額
const getCatStore = async (req, res) => {
    const { userData } = req.body;
    const storeResult = await catService.getCatStore();
    const coinResult = await userService.checkCoins(userData.userId);
    return res.status(200).json({
        data: {
            store: storeResult,
            purchased: userData.purchased,
            coins: coinResult,
            message: internalMessages[2403],
        },
    });
};

// TODO: 獲取貓咪任務，如果沒有任務或者任務過期，賦予新任務。
const getCatMission = async (req, res) => {
    const { userData } = req.body;
    let missionList = await catService.getCurrentMission(userData.userId);
    let missionNeedRenew = false;
    if (missionList === null) {
        missionList = await catService.createNewMission(userData.userId);
        missionNeedRenew = true;
    }
    const ttl = await catService.getMissionCacheTTL(userData.userId);
    return res
        .status(200)
        .json({ data: { missionList, ttl, missionNeedRenew, message: internalMessages[2404] } });
};

// TODO: 使用者變更貓咪皮膚
const patchCat = async (req, res) => {
    const { userData, catStyle } = req.body;
    await catService.checkHasThisStyle(userData['purchased'], catStyle);
    await catService.patchStyle(userData, catStyle);
    return res.status(200).json({ data: { message: internalMessages[2401] } });
};

// TODO: 更新任務完成狀態，檢查並發送獎勵
const patchCatMission = async (req, res) => {
    const { userData, completedMissionId } = req.body;
    let cacheMissions = await catService.checkCurrentMission(userData.userId);
    let result = await catService.checkValidReword(cacheMissions, completedMissionId);
    if (result.reward > 0) {
        await catService.updateMissionState(userData.userId, result.missions);
        await userService.updateUserCoins(result.reward, userData.userId);
    }
    return res.status(200).json({ data: { message: internalMessages[2405] } });
};

// TODO: 使用者購買貓咪新造型
const postCatStore = async (req, res) => {
    const { userData, purchased } = req.body;
    const storeItemResult = await userService.checkAffordThisPurchase(userData.userId, purchased);
    await userService.purchaseItems(userData, storeItemResult);
    return res.status(200).json({ data: { message: internalMessages[2402] } });
};

module.exports = {
    getCat,
    getCatStore,
    getCatMission,
    patchCat,
    patchCatMission,
    postCatStore,
};
