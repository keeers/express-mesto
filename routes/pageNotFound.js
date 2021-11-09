const router = require('express').Router();
const { pageNotFound } = require('../controllers/pageNotFound');

router.get('/', pageNotFound);
router.get('/:text', pageNotFound);

module.exports = router;
