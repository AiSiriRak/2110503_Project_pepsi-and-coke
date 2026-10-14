const express = require('express');

const { protect, authorize } = require('../middleware/auth');
const { getCoworkingSpaces } = require('../controllers/coworkingspaces');

const router = express.Router();

router.route('/').get(protect, authorize('user'), getCoworkingSpaces);

module.exports = router;
