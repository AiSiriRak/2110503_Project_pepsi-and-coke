const CoworkingSpace = require("../models/CoworkingSpace");

// @desc    Get all coworking spaces
// @route   GET /api/v1/coworkingSpaces
// @access  Public
exports.getCoworkingSpaces = async (req, res, next) => {
  try {
    const coworkingSpaces = await CoworkingSpace.find();
    res.status(200).json({
      success: true,
      count: coworkingSpaces.length,
      data: coworkingSpaces,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false, message: error });
  }
};
