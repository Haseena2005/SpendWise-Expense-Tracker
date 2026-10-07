const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const {
  monthlyAnalyticsValidation,
  yearlyAnalyticsValidation,
  dateRangeAnalyticsValidation
} = require('../validators/analyticsValidator');
const { validateRequest } = require('../middleware/validationMiddleware');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/dashboard', analyticsController.getDashboardAnalytics);
router.get('/monthly', monthlyAnalyticsValidation, validateRequest, analyticsController.getMonthlyAnalytics);
router.get('/yearly', yearlyAnalyticsValidation, validateRequest, analyticsController.getYearlyAnalytics);
router.get('/category-expenses', dateRangeAnalyticsValidation, validateRequest, analyticsController.getCategoryExpenses);
router.get('/income-vs-expense', dateRangeAnalyticsValidation, validateRequest, analyticsController.getIncomeVsExpense);

module.exports = router;
