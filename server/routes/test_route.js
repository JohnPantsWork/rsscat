const router = require('express').Router();

const { wrapAsync } = require('../../util/util');
const { postTest } = require('../controller/test_controller');

router.route('/test').post(wrapAsync(postTest));

module.exports = router;
