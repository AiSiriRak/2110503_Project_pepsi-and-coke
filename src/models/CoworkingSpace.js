const mongoose = require('mongoose');

// Co-working Space Schema
const CoworkingSpaceSchema = new mongoose.Schema(
    {
        // Name
        name: {
            type: String,
            required: [true, 'Please add a name.'],
        },

        // Address
        address: {
            type: String,
            required: [true, 'Please add an address.'],
        },

        // Telephone Number
        telephoneNumber: {
            type: String,
            required: [true, 'Please add a telephone number.'],
        },

        // Open time
        openTime: {
            type: String,
            required: [true, 'Please add an opening time.'],
            match: [
                /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
                'Please use HH:mm format for open time (e.g. 08:00).',
            ],
        },

        // Close time
        closeTime: {
            type: String,
            required: [true, 'Please add a closing time.'],
            match: [
                /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
                'Please use HH:mm format for close time (e.g. 08:00).',
            ],
        },

        // Maximum Capacity: for add a co-booker
        maximumCapacity: {
            type: Number,
            required: [true, 'Please add a maximum capacity.'],
            min: [1, 'Capacity must be at least 1.'],
        },
    },
    {
        // Timestamp for created at and updated at
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

// Virtual populate: for reservation to use this model directy.
CoworkingSpaceSchema.virtual('reservations', {
    ref: 'Reservation',
    localField: '_id',
    foreignField: 'coworkingSpace',
    justOne: false,
});

module.exports = mongoose.model('CoworkingSpace', CoworkingSpaceSchema);
