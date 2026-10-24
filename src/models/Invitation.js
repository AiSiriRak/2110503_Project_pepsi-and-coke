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

        // Inviter ID
        inviter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Please add a inviter id.'],
        },

        // Recipient ID
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Please add a recipient id.'],
        },

        status: {
            type: String,
            enum: ['pending', 'accepted', 'declined'],
            default: 'pending',
        },
    },
    {
        // Timestamp for created at and updated at
        timestamps: true,
    },
);

// Create Compound Unique Index: 1 pending reservation's invited per 1 Recipient
InvitationSchema.index(
    { reservation: 1, recipient: 1 },
    { unique: true, partialFilterExpression: { status: 'pending' } },
);

module.exports = mongoose.model('Invitation', InvitationSchema);
