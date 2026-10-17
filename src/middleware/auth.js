const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ErrorResponse, MSG } = require('../utils/error');

// Protect routes
exports.protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
        return next(new ErrorResponse(MSG.NOT_AUTHORIZED, 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id);

        next();
    } catch (error) {
        console.log(error.stack);
        return next(new ErrorResponse(MSG.NOT_AUTHORIZED, 401));
    }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        // Check if there are role
        if (!req.user) {
            return next(new ErrorResponse(MSG.NOT_AUTHORIZED, 401));
        }

        // Check if the role is allowed
        if (!roles.includes(req.user.role)) {
            return next(new ErrorResponse(MSG.FORBIDDEN(req.user.role), 403));
        }

        next();
    };
};
