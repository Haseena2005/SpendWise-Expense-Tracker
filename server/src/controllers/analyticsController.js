const analyticsService = require('../services/analyticsService');
const { successResponse } = require('../utils/apiResponse');

class AnalyticsController {
  async getDashboardAnalytics(req, res, next) {
    try {
      const data = await analyticsService.getDashboardAnalytics(req.user._id);
      return successResponse(res, 'Dashboard analytics retrieved successfully', data);
    } catch (error) {
      next(error);
    }
  }

  async getMonthlyAnalytics(req, res, next) {
    try {
      const { year, month } = req.query;
      const data = await analyticsService.getMonthlyAnalytics(year, month, req.user._id);
      return successResponse(res, 'Monthly analytics retrieved successfully', data);
    } catch (error) {
      next(error);
    }
  }

  async getYearlyAnalytics(req, res, next) {
    try {
      const { year } = req.query;
      const data = await analyticsService.getYearlyAnalytics(year, req.user._id);
      return successResponse(res, 'Yearly analytics retrieved successfully', data);
    } catch (error) {
      next(error);
    }
  }

  async getCategoryExpenses(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const data = await analyticsService.getCategoryExpenses(startDate, endDate, req.user._id);
      return successResponse(res, 'Category expense analytics retrieved successfully', data);
    } catch (error) {
      next(error);
    }
  }

  async getIncomeVsExpense(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const data = await analyticsService.getIncomeVsExpenseAnalytics(startDate, endDate, req.user._id);
      return successResponse(res, 'Income vs Expense analytics retrieved successfully', data);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AnalyticsController();
