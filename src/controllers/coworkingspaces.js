const CoworkingSpace = require('../models/CoworkingSpace');

// @desc    Get all coworking spaces
// @route   GET /api/v1/coworking-spaces
// @access  Public
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
