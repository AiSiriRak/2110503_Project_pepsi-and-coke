const CoworkingSpace = require('../models/CoworkingSpace');
const Reservation = require('../models/Reservation');
const { ErrorResponse, MSG } = require('../utils/error');

// @desc    Get all coworking spaces
// @route   GET /api/v1/coworking-spaces
// @access  Protected
exports.getCoworkingSpaces = async (req, res, next) => {
    try {
        let query;

        // Copy req.query
        const reqQuery = { ...req.query };

        // Starting field
        const removeFields = ['select', 'sort', 'page', 'limit'];

        // Remove unrelated field
        removeFields.forEach((param) => delete reqQuery[param]);
        console.log(reqQuery);

        // Create query string
        let queryStr = JSON.stringify(reqQuery);

        // Add $ in front of query operator (gt, gte, lt, lte)
        queryStr = queryStr.replace(
            /\b(gt|gte|lt|lte)\b/g,
            (match) => `$${match}`
        );

        // Finding resource
        query = CoworkingSpace.find(JSON.parse(queryStr));

        // Select Fields
        if (req.query.select) {
            const fields = req.query.select.split(',').join(' ');
            query = query.select(fields);
        }

        // Sort
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy)
        } else {
            query = query.sort('-createdAt');
        }

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 25;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await CoworkingSpace.countDocuments(
            JSON.parse(queryStr)
        );

        query = query.skip(startIndex).limit(limit);

        // Executing query
        const coworkingspaces = await query;

        // Pagination info for response
        const pagination = {};

        if (endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit,
            };
        }

        if (startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit,
            };
        }

        res.status(200).json({
            success: true,
            count: coworkingspaces.length,
            pagination,
            data: coworkingspaces,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get a Co-working Space by ID
// @route   GET /api/v1/coworking-spaces/:id
// @access  Protected
exports.getCoworkingSpace = async (req, res, next) => {
    try {
        // Find Co-working Space by ID
        const coworkingSpace = await CoworkingSpace.findById(req.params.id);

        // Co-working Space with the ID not found
        if (!coworkingSpace) {
            return next(new ErrorResponse(MSG.COWORKING_SPACE_NOT_FOUND(req.params.id), 404));
        }

        // Found Co-working Space
        res.status(200).json({
            success: true,
            data: coworkingSpace,
        });
    } catch (error) {
        next(error);
    }
}

// @desc    Create a new Co-working Space
// @route   POST /api/v1/coworking-spaces
// @access  Private
exports.createCoworkingSpace = async (req, res, next) => {
    try {
        // Create Co-working Space
        const coworkingSpace = await CoworkingSpace.create(req.body);

        res.status(201).json({
            success: true,
            data: coworkingSpace,
        });
    } catch (error) {
        next(error);
    }
}

// @desc    Update a Co-working Space by ID
// @route   PUT /api/v1/coworking-spaces/:id
// @access  Private
exports.updateCoworkingSpace = async (req, res, next) => {
    try {
        // Find and update Co-working Space by ID
        const coworkingSpace = await CoworkingSpace.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        // Co-working Space with the ID not found
        if (!coworkingSpace) {
            return next(new ErrorResponse(MSG.COWORKING_SPACE_NOT_FOUND(req.params.id), 404));
        }

        // Update success
        res.status(200).json({
            success: true,
            data: coworkingSpace,
        });
    } catch (error) {
        next(error);
    }
}

// @desc    Delete a Co-working Space by ID
// @route   DELETE /api/v1/coworking-spaces/:id
// @access  Private
exports.deleteCoworkingSpace = async (req, res, next) => {
    try {
        // Find Co-working Space by ID
        const coworkingSpace = await CoworkingSpace.findById(req.params.id);

        // Co-working Space with the ID not found
        if (!coworkingSpace) {
            return next(new ErrorResponse(MSG.COWORKING_SPACE_NOT_FOUND(req.params.id), 404));
        }

        // Delete reservation from the Co-working Space with ID
        await Reservation.deleteMany({
            coworkingSpace: req.params.id
        });

        // Delete Co-working Space with ID
        await CoworkingSpace.deleteOne({
            _id: req.params.id
        });

        // Delete success
        res.status(200).json({
            success: true,
            data: {},
        });
    } catch (error) {
        next(error);
    }
}