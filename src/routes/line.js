const express = require('express');
const { createLinkCode, getAddLineLink } = require('../controllers/line');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/link-code').post(protect, createLinkCode);
router.route('/add-friend').get(protect, getAddLineLink);

module.exports = router;
