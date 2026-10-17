const express = require('express');

const { protect } = require('../middleware/auth');
const {
    getReservations,
    getReservation,
    createReservation,
    updateResrvation,
    deleteReservation,
} = require('../controllers/reservations');

const router = express.Router({ mergeParams: true });

router
    .route('/')
    .get(protect, getReservations)
    .post(protect, createReservation);

router
    .route('/:id')
    .get(protect, getReservation)
    .put(protect, updateResrvation)
    .delete(protect, deleteReservation);

module.exports = router;
