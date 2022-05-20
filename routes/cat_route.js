const router = require('express').Router();

// internal functions
const { wrapAsync } = require('../../util/util');

// controllers
const {
    getCatState,
    patchCatState,
    postCatStore,
    getCatStore,
    getCatMission,
    patchCatMission,
} = require('../controller/cat_controller');
const { sessionCheck } = require('../controller/user_controller');

// routers
router.route('/cat').get(sessionCheck, wrapAsync(getCatState));
router.route('/cat').patch(sessionCheck, wrapAsync(patchCatState));
router.route('/cat/store').post(sessionCheck, wrapAsync(postCatStore));
router.route('/cat/store').get(sessionCheck, wrapAsync(getCatStore));
router.route('/cat/mission').get(sessionCheck, wrapAsync(getCatMission));
router.route('/cat/mission').patch(sessionCheck, wrapAsync(patchCatMission));

module.exports = router;
