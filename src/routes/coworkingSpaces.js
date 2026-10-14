const express = require('express');

const { protect, authorize } = require('../middleware/auth');
const {
    getCoworkingSpaces,
    createCoworkingSpace,
} = require('../controllers/coworkingspaces');

const router = express.Router();

router
    .route('/')
    .get(protect, getCoworkingSpaces)
    .post(protect, authorize('admin'), createCoworkingSpace);

module.exports = router;
