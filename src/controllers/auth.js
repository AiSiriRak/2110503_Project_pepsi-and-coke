const User = require('../models/User');
const { MSG, ErrorResponse } = require('../utils/error');

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const { name, telephoneNumber, email, password, role } = req.body;

        // Create user
        const user = await User.create({
            name,
            telephoneNumber,
            email,
            password,
            role,
        });

        // Send token response
        sendTokenResponse(user, 201, res);
    } catch (error) {
        next(error);
    }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return next(new ErrorResponse(MSG.MISSING_CREDENTIALS, 400));
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return next(new ErrorResponse(MSG.INVALID_CREDENTIALS, 401));
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return next(new ErrorResponse(MSG.INVALID_CREDENTIALS, 401));
        }

        // Send token response (only once)
        sendTokenResponse(user, 200, res);
    } catch (error) {
        next(error);
    }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
        ),
        httpOnly: true,
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res.status(statusCode)
        .cookie('token', token, options)
        .json({ success: true, token });
};

// @desc    Get current Logged in user
// @route   POST /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return next(new ErrorResponse(MSG.USER_NOT_FOUND, 404));
        }

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};
