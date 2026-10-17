const mongoose = require('mongoose');

// Reservation Schema
const ReservationSchema = new mongoose.Schema(
    {
        // Reserve Date
        reserveDate: {
            type: String,
            required: [true, 'Please add a reserve date.'],
            match: [
                /^\d{4}-\d{2}-\d{2}$/,
                'Please use YYYY-MM-DD format for reserve date.',
            ],
        },

        // Co-working Space ID
        coworkingSpace: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CoworkingSpace',
            required: [true, 'Please choose a Co-working space.'],
        },

        // User ID
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Please add a user id'],
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

// Create Compound Unique Index: 1 Reservation per 1 Co-working Space
ReservationSchema.index(
    { coworkingSpace: 1, reserveDate: 1 },
    { unique: true },
);

module.exports = mongoose.model('Reservation', ReservationSchema);
