const router = require('express').Router();

// internal functions
const { wrapAsync } = require('../util/utils');

// controllers
const {
    getCat,
    patchCat,
    getCatStore,
    postCatStore,
    getCatMission,
    patchCatMission,
} = require('../controller/cat_controller');
const { checkSession } = require('../controller/user_controller');

// routers
router.route('/cat').get(checkSession, wrapAsync(getCat));
router.route('/cat').patch(checkSession, wrapAsync(patchCat));
router.route('/cat/store').get(checkSession, wrapAsync(getCatStore));
router.route('/cat/store').post(checkSession, wrapAsync(postCatStore));
router.route('/cat/mission').get(checkSession, wrapAsync(getCatMission));
router.route('/cat/mission').patch(checkSession, wrapAsync(patchCatMission));

module.exports = router;
