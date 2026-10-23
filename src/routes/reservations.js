const express = require('express');

const { protect } = require('../middleware/auth');
const {
    getReservations,
    getReservation,
    createReservation,
    updateReservation,
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
    .put(protect, updateReservation)
    .delete(protect, deleteReservation);

module.exports = router;
