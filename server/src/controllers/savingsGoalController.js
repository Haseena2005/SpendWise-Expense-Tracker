const savingsGoalService = require('../services/savingsGoalService');
const { successResponse } = require('../utils/apiResponse');

class SavingsGoalController {
  async getGoals(req, res, next) {
    try {
      const data = await savingsGoalService.getGoals(req.user._id);
      return successResponse(res, 'Savings goals retrieved successfully', data);
    } catch (err) {
      next(err);
    }
  }

  async createGoal(req, res, next) {
    try {
      const goal = await savingsGoalService.createGoal(req.body, req.user._id);
      return successResponse(res, 'Savings goal created successfully', goal, 201);
    } catch (err) {
      next(err);
    }
  }

  async updateGoal(req, res, next) {
    try {
      const updated = await savingsGoalService.updateGoal(req.params.id, req.body, req.user._id);
      return successResponse(res, 'Savings goal updated successfully', updated);
    } catch (err) {
      next(err);
    }
  }

  async deleteGoal(req, res, next) {
    try {
      const deleted = await savingsGoalService.deleteGoal(req.params.id, req.user._id);
      return successResponse(res, 'Savings goal deleted successfully', { id: deleted._id });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new SavingsGoalController();
