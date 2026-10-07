const { errorResponse } = require('../utils/apiResponse');

// 404 Not Found Middleware
const notFoundHandler = (req, res, next) => {
  return errorResponse(res, `Route not found: ${req.originalUrl}`, [], 404);
};

// Global Error Handler Middleware
const errorHandler = (err, req, res, next) => {
  // Only log full error details server-side
  console.error('[Error Middleware]', err.message || err);

  let statusCode = err.statusCode || err.status || (res.statusCode === 200 ? 500 : res.statusCode);
  let message = err.message || 'Internal Server Error';
  let errors = [];

  // Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for field: ${err.path}`;
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
  }

  // MongoDB Duplicate Key Error (Code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue ? err.keyValue[field] : '';
    message = `Duplicate entry: A record with ${field} '${value}' already exists.`;
  }

  // JSON Syntax Error
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Malformed JSON body in request';
  }

  // In production, hide internal error details for 500 errors
  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    message = 'Internal Server Error';
    errors = [];
  }

  return errorResponse(res, message, errors, statusCode);
};

module.exports = {
  notFoundHandler,
  errorHandler
};
