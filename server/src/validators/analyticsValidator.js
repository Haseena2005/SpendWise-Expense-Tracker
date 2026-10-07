const { query } = require('express-validator');

const monthlyAnalyticsValidation = [
  query('year')
    .optional()
    .isInt({ min: 2000, max: 2100 })
    .withMessage('Year must be a valid integer between 2000 and 2100'),
  query('month')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage('Month must be an integer between 1 and 12')
];

const yearlyAnalyticsValidation = [
  query('year')
    .optional()
    .isInt({ min: 2000, max: 2100 })
    .withMessage('Year must be a valid integer between 2000 and 2100')
];

const dateRangeAnalyticsValidation = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('startDate must be a valid ISO date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('endDate must be a valid ISO date')
];

module.exports = {
  monthlyAnalyticsValidation,
  yearlyAnalyticsValidation,
  dateRangeAnalyticsValidation
};
