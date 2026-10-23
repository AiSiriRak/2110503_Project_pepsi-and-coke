const express = require('express');

const { protect } = require('../middleware/auth');
const {
    getReservations,
    getReservation,
    createReservation,
    updateReservation,
    deleteReservation,
} = require('../controllers/reservations');

// Include other resource routers
const invitationRouter = require('./invitations');

const router = express.Router({ mergeParams: true });

// Re-route into other resource routers
router.use('/:reservationId/invitations/', invitationRouter);

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
