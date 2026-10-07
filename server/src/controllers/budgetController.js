const budgetService = require('../services/budgetService');
const { successResponse } = require('../utils/apiResponse');

class BudgetController {
  async getBudgets(req, res, next) {
    try {
      const { month, year } = req.query;
      const data = await budgetService.getBudgets(month, year, req.user._id);
      return successResponse(res, 'Budgets retrieved successfully', data);
    } catch (error) {
      next(error);
    }
  }

  async createBudget(req, res, next) {
    try {
      const budget = await budgetService.createBudget(req.body, req.user._id);
      return successResponse(res, 'Budget created successfully', budget, 201);
    } catch (error) {
      next(error);
    }
  }

  async updateBudget(req, res, next) {
    try {
      const updated = await budgetService.updateBudget(req.params.id, req.body, req.user._id);
      return successResponse(res, 'Budget updated successfully', updated);
    } catch (error) {
      next(error);
    }
  }

  async deleteBudget(req, res, next) {
    try {
      const deleted = await budgetService.deleteBudget(req.params.id, req.user._id);
      return successResponse(res, 'Budget deleted successfully', { id: deleted._id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BudgetController();
