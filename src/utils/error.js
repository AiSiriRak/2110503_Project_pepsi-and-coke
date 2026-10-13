class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}
module.exports = ErrorResponse;

module.exports = {
  INVALID_CREDENTIALS: "Invalid credentials",
  MISSING_CREDENTIALS: "Please provide an email and password",
  NOT_AUTHORIZED: "Not authorize to access this route",
  USER_NOT_FOUND: "User not found",
  EMAIL_ALREADY_REGISTERED: "Email is already registered.",
  SERVER_ERROR: "Internal server error.",
};
