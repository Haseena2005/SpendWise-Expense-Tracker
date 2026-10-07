/**
 * Send success JSON response
 * @param {Object} res - Express response object
 * @param {String} message - Custom message
 * @param {Object|Array} data - Payload data
 * @param {Number} statusCode - HTTP status code
 */
const successResponse = (res, message = 'Success', data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Send error JSON response
 * @param {Object} res - Express response object
 * @param {String} message - Error description
 * @param {Array} errors - Detailed errors list
 * @param {Number} statusCode - HTTP status code
 */
const errorResponse = (res, message = 'An error occurred', errors = [], statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};

module.exports = {
  successResponse,
  errorResponse
};
