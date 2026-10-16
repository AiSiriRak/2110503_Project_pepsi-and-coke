const express = require('express');

const { protect, authorize } = require('../middleware/auth');
const {
    getCoworkingSpaces,
    getCoworkingSpace,
    createCoworkingSpace,
    updateCoworkingSpace,
    deleteCoworkingSpace,
} = require('../controllers/coworkingspaces');

const router = express.Router();

router
    .route('/')
    .get(getCoworkingSpaces)
    .post(protect, authorize('admin'), createCoworkingSpace);

router
    .route('/:id')
    .get(getCoworkingSpace)
    .put(protect, authorize('admin'), updateCoworkingSpace)
    .delete(protect, authorize('admin'), deleteCoworkingSpace);

module.exports = router;
