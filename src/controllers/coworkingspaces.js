const CoworkingSpace = require('../models/CoworkingSpace');

// @desc    Get all coworking spaces
// @route   GET /api/v1/coworking-spaces
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
        next(error);
    }
};
