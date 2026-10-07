const { body, param, query } = require('express-validator');

const createCategoryValidation = [
  body('name')
    .notEmpty()
    .withMessage('Category name is required')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Category name must be between 2 and 50 characters'),
  body('type')
    .notEmpty()
    .withMessage('Category type is required')
    .isIn(['income', 'expense'])
    .withMessage('Category type must be income or expense'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Description cannot exceed 200 characters'),
  body('icon')
    .optional()
    .trim(),
  body('color')
    .optional()
    .trim()
];

const updateCategoryValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid category ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Category name must be between 2 and 50 characters'),
  body('type')
    .optional()
    .isIn(['income', 'expense'])
    .withMessage('Category type must be income or expense'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Description cannot exceed 200 characters'),
  body('icon')
    .optional()
    .trim(),
  body('color')
    .optional()
    .trim(),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

const validateCategoryIdParam = [
  param('id')
    .isMongoId()
    .withMessage('Invalid category ID')
];

const categoryQueryValidation = [
  query('type')
    .optional()
    .isIn(['income', 'expense'])
    .withMessage('Type filter must be income or expense')
];

module.exports = {
  createCategoryValidation,
  updateCategoryValidation,
  validateCategoryIdParam,
  categoryQueryValidation
};
