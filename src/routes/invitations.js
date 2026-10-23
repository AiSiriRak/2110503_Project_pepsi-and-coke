const express = require('express');

const { protect } = require('../middleware/auth');
const {
    getInvitations,
    getInvitation,
    createInvitation,
    updateInvitation,
    deleteInvitation,
} = require('../controllers/invitations');

const router = express.Router();

router
    .route('/')
    .get(protect, getInvitations)
    .post(protect, createInvitation);

router
    .route('/:id')
    .get(protect, getInvitation)
    .put(protect, updateInvitation)
    .delete(protect, deleteInvitation);

module.exports = router;
