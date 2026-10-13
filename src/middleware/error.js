const MSG = require("../utils/error");

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message;

  // Mongoose validation error (missing field, invalid email, short password)
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  // Duplicate key (e.g. email already exists)
  if (err.code === 11000) {
    statusCode = 400;
    message = MSG.EMAIL_ALREADY_REGISTERED;
  }

  // Invalid or expired JWT
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    statusCode = 401;
    message = MSG.NOT_AUTHORIZED;
  }

  // Server fault: log the stack, hide details from the client
  if (statusCode === 500) {
    console.log(err.stack);
    message = MSG.SERVER_ERROR;
  }

  res.status(statusCode).json({ success: false, message });
};

module.exports = errorHandler;
