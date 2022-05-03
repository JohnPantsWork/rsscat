const router = require('express').Router();

const { wrapAsync } = require('../../util/util');
const { postCutWordsPython, postCutWordsJieba } = require('../controller/word_controller');

router.route('/cutword').post(wrapAsync(postCutWordsPython));
router.route('/cutword/backup').post(wrapAsync(postCutWordsJieba));

module.exports = router;
