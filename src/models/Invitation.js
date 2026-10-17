const mongoose = require('mongoose');

// Invitation Schema
const InvitationSchema = new mongoose.Schema(
    {
        // Reservation ID
        reservation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Reservation',
            required: [true, 'Please choose a reservation.'],
        },

        // User ID (got invite)
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Please add a user id'],
        },

        status: {
            type: String,
            enum: ['wait', 'accepted', 'declined'],
            default: 'wait',
        },
    },
    {
        // Timestamp for created at and updated at
        timestamps: true,
    },
);

// Create Compound Unique Index: 1 Reservation per 1 User
InvitationSchema.index({ reservation: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Invitation', InvitationSchema);
