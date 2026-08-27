const logger = require('../utils/logger');
const { sendError } = require('../utils/apiResponse');

// 404 Not Found Handler
const notFoundHandler = (req, res) => {
  return sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
};

// Global Error Handler
const globalErrorHandler = (err, req, res, next) => {
  logger.error(`Unhandled Error [${req.method} ${req.originalUrl}]:`, err);

  const statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose CastError (bad ObjectId)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    return sendError(res, `Resource not found with invalid ID format for field ${err.path}.`, 400);
  }

  // Handle Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return sendError(res, `Duplicate value for ${field}. Please use a unique value.`, 409);
  }

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors || {}).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return sendError(res, 'Validation Error', 422, errors);
  }

  return sendError(res, message, statusCode);
};

module.exports = {
  notFoundHandler,
  globalErrorHandler,
};
