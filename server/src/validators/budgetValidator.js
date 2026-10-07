const { body, param, query } = require('express-validator');
const mongoose = require('mongoose');

const createBudgetValidation = [
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Category must be a valid MongoDB ObjectId'),
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number greater than 0'),
  body('month')
    .notEmpty()
    .withMessage('Month is required')
    .isInt({ min: 1, max: 12 })
    .withMessage('Month must be an integer between 1 and 12'),
  body('year')
    .notEmpty()
    .withMessage('Year is required')
    .isInt({ min: 2000, max: 2100 })
    .withMessage('Year must be between 2000 and 2100')
];

const updateBudgetValidation = [
  param('id')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Budget ID must be a valid MongoDB ObjectId'),
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number greater than 0')
];

const validateBudgetIdParam = [
  param('id')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Budget ID must be a valid MongoDB ObjectId')
];

const budgetQueryValidation = [
  query('month')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage('Month must be between 1 and 12'),
  query('year')
    .optional()
    .isInt({ min: 2000, max: 2100 })
    .withMessage('Year must be between 2000 and 2100')
];

module.exports = {
  createBudgetValidation,
  updateBudgetValidation,
  validateBudgetIdParam,
  budgetQueryValidation
};
