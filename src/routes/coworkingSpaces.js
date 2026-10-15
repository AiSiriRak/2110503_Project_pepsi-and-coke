const express = require('express');

const { protect, authorize } = require('../middleware/auth');
const {
    getCoworkingSpaces,
    getCoworkingSpace,
    createCoworkingSpace,
} = require('../controllers/coworkingspaces');

const router = express.Router();

router
    .route('/')
    .get(protect, getCoworkingSpaces)
    .post(protect, authorize('admin'), createCoworkingSpace);

router
    .route('/:id')
    .get(protect, getCoworkingSpace);

module.exports = router;
