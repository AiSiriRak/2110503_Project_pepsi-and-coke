const express = require('express');

const { protect, authorize } = require('../middleware/auth');
const {
    // controllers functions
} = require('../controllers/reservations');

const router = express.Router();

router.route('/');

router.route('/:id');

module.exports = router;
