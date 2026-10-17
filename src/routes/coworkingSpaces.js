const express = require('express');

const { protect, authorize } = require('../middleware/auth');
const {
    getCoworkingSpaces,
    getCoworkingSpace,
    createCoworkingSpace,
    updateCoworkingSpace,
    deleteCoworkingSpace,
} = require('../controllers/coworkingspaces');

//Include other resource routers
const reservationRouter = require('./reservations');

const router = express.Router();

//Re-route into other resource routers
router.use('/:coworkingSpaceId/reservations/', reservationRouter);

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
