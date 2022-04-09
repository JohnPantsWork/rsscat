const router = require('express').Router();

// 透過該function來包裹路由，捕捉錯誤。
const { wrapAsync } = require('../../util/wrapAsync');

// 引入contorller中的路由。
const { postData, getData, deleteData } = require('../controller/controller.js');

// 透過RESTful API精神。
router.route('/shortUrl').post(wrapAsync(postShortRand));
router.route('/shortUrl/:shortUrl').get(wrapAsync(getShortRand));
router.route('/shortUrl').delete(wrapAsync(deleteShortRand));

// 輸出路由。
module.exports = router;
