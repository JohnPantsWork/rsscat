const router = require('express').Router();

const { wrapAsync } = require('../../util/util');
const { cutWords } = require('../controller/main_controller.js');

router.route('/cutWords').post(wrapAsync(cutWords));

module.exports = router;
