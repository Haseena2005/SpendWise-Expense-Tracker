const { body, param, query } = require('express-validator');

const createTransactionValidation = [
  body('type')
    .notEmpty()
    .withMessage('Transaction type is required')
    .isIn(['income', 'expense'])
    .withMessage('Type must be income or expense'),
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ gt: 0 })
    .withMessage('Amount must be a positive number'),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isMongoId()
    .withMessage('Category must be a valid ObjectId'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .trim()
    .isLength({ min: 2, max: 250 })
    .withMessage('Description must be between 2 and 250 characters'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO date format'),
  body('paymentMethod')
    .optional()
    .isIn(['Cash', 'Card', 'UPI', 'Bank Transfer', 'Other'])
    .withMessage('Invalid payment method'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];

const updateTransactionValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid transaction ID'),
  body('type')
    .optional()
    .isIn(['income', 'expense'])
    .withMessage('Type must be income or expense'),
  body('amount')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Amount must be a positive number'),
  body('category')
    .optional()
    .isMongoId()
    .withMessage('Category must be a valid ObjectId'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 2, max: 250 })
    .withMessage('Description must be between 2 and 250 characters'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO date format'),
  body('paymentMethod')
    .optional()
    .isIn(['Cash', 'Card', 'UPI', 'Bank Transfer', 'Other'])
    .withMessage('Invalid payment method'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];

const validateIdParam = [
  param('id')
    .isMongoId()
    .withMessage('Invalid transaction ID')
];

const queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be an integer >= 1'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be an integer between 1 and 100'),
  query('type')
    .optional()
    .isIn(['income', 'expense'])
    .withMessage('Type filter must be income or expense'),
  query('category')
    .optional()
    .isMongoId()
    .withMessage('Category filter must be a valid ObjectId'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  query('minAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('minAmount must be >= 0'),
  query('maxAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('maxAmount must be >= 0'),
  query('paymentMethod')
    .optional()
    .isIn(['Cash', 'Card', 'UPI', 'Bank Transfer', 'Other'])
    .withMessage('Invalid payment method filter'),
  query('search')
    .optional()
    .trim(),
  query('sort')
    .optional()
    .trim(),
  query('sortBy')
    .optional()
    .trim()
];

module.exports = {
  createTransactionValidation,
  updateTransactionValidation,
  validateIdParam,
  queryValidation
};
