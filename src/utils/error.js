class ErrorResponse extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

const MSG = {
    // 400 Bad Request
    MISSING_CREDENTIALS: 'Please provide an email and password.',
    EMAIL_ALREADY_REGISTERED: 'Email is already registered.',
    WRONG_OBJECT_ID_FORMAT: 'Wrong object ID format',

    // 401 Unauthorized
    INVALID_CREDENTIALS: 'Invalid credentials',
    NOT_AUTHORIZED: 'Not authorize to access this route',

    // 403 Forbidden
    FORBIDDEN: (role) =>
        `User role ${role} is not authorized to access this route`,

    // 404 Not Found
    USER_NOT_FOUND: 'User not found',
    COWORKING_SPACE_NOT_FOUND: (id) =>
        `Coworking space not found with ID of ${id}`,

    // 500 Internal Server Error
    SERVER_ERROR: 'Internal server error',
};

module.exports = {
    ErrorResponse,
    MSG,
};
