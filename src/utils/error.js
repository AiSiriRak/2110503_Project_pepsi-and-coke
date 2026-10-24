class ErrorResponse extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

const MSG = {
    // 400 Bad Request
    MISSING_CREDENTIALS: 'Please provide an email and password.',
    WRONG_OBJECT_ID_FORMAT: 'Wrong object ID format',
    RESERVATION_LIMIT: (id) =>
        `The user with ID ${id} has already made 3 reservations.`,
    INVITATION_LIMIT_USER: (id) =>
        `The user with ID ${id} has already have 3 active invitations.`,
    INVITATION_LIMIT_RESERVATION: (id, amount) =>
        `The reservation with ID ${id} has already have ${amount} active invitations and cobooker.`,
    DUPLICATE_KEY: 'Duplicate value entered for a unique field.',
    EMAIL_ALREADY_REGISTERED: 'Email is already registered.',
    COWORKING_SPACE_ALREADY_RESERVED:
        'This co-working space is already reserved for the selected date.',
    USER_ALREADY_INVITED: 'User has already been invited to this reservation.',
    INVALID_STATUS: 'Status must be accepted or declined',
    INVITATION_INACTIVE: (status) => `Invitation has already been ${status}`,

    // 401 Unauthorized
    INVALID_CREDENTIALS: 'Invalid credentials',
    NOT_AUTHORIZED: 'Not authorize to access this route',

    // 403 Forbidden
    FORBIDDEN: (role) =>
        `User role ${role} is not authorized to access this route`,
    NOT_RESOURCE_OWNER:
        'User is not authorized to access or modify this resource',

    // 404 Not Found
    USER_NOT_FOUND: 'User not found',
    COWORKING_SPACE_NOT_FOUND: (id) =>
        `Coworking space not found with ID of ${id}`,
    RESERVATION_NOT_FOUND: (id) => `Reservation not found with ID of ${id}`,
    INVITATION_NOT_FOUND: (id) => `Invitation not found with ID of ${id}`,

    // 500 Internal Server Error
    SERVER_ERROR: 'Internal server error',
};

module.exports = {
    ErrorResponse,
    MSG,
};
