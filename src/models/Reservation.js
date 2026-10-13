const mongoose = require('mongoose');

// Reservation Schema
const ReservationSchema = new mongoose.Schema(
    {
        // Reserve Date
        reserveDate: {
            type: Date,
            required: [true, 'Please add a reserve date.'],
        },

        // Co-working Space ID
        coworkingSpace: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CoworkingSpace',
            required: true,
        },

        // User ID
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        // Co-booker
        cobooker: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
    },
    {
        // Timestamp for created at and updated at
        timestamps: true,
    },
);

module.exports = mongoose.model('Reservation', ReservationSchema);
