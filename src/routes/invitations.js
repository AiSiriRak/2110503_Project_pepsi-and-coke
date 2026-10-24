const express = require('express');

const { protect } = require('../middleware/auth');
const {
    getInvitations,
    getInvitation,
    createInvitation,
    respondInvitation,
    deleteInvitation,
} = require('../controllers/invitations');

const router = express.Router({ mergeParams: true });

router.route('/').get(protect, getInvitations).post(protect, createInvitation);

router
    .route('/:id')
    .get(protect, getInvitation)
    .put(protect, respondInvitation)
    .delete(protect, deleteInvitation);

module.exports = router;
