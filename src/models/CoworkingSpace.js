const mongoose = require("mongoose");

// Co-working Space Schema
const CoworkingSpaceSchema = new mongoose.Schema(
  {
    // Name
    name: {
      type: String,
      required: [true, "Please add a name."],
    },

    // Address
    address: {
      type: String,
      required: [true, "Please add an address."],
    },

    // Telephone Number
    telephoneNumber: {
      type: String,
      required: [true, "Please add a telephone number."],
    },

    // Open time
    openTime: {
      type: Date,
      required: [true, "Please add an opening time."],
    },

    // Close time
    closeTime: {
      type: Date,
      required: [true, "Please add a closing time."],
    },

    // Maximum Capacity: for add a co-booker
    maximumCapacity: {
      type: Number,
      required: [true, "Please add a maximum capacity."],
    },
  },
  {
    // Timestamp for created at and updated at
    timestamps: true,
  },
);

module.exports = mongoose.model("CoworkingSpace", CoworkingSpaceSchema);
