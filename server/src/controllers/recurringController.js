const recurringService = require('../services/recurringService');
const { successResponse } = require('../utils/apiResponse');

class RecurringController {
  async getRecurring(req, res, next) {
    try {
      const data = await recurringService.getRecurringTransactions(req.user._id);
      return successResponse(res, 'Recurring transactions retrieved successfully', data);
    } catch (err) {
      next(err);
    }
  }

  async createRecurring(req, res, next) {
    try {
      const data = await recurringService.createRecurringTransaction(req.body, req.user._id);
      return successResponse(res, 'Recurring transaction created successfully', data, 201);
    } catch (err) {
      next(err);
    }
  }

  async updateRecurring(req, res, next) {
    try {
      const data = await recurringService.updateRecurringTransaction(req.params.id, req.body, req.user._id);
      return successResponse(res, 'Recurring transaction updated successfully', data);
    } catch (err) {
      next(err);
    }
  }

  async deleteRecurring(req, res, next) {
    try {
      const deleted = await recurringService.deleteRecurringTransaction(req.params.id, req.user._id);
      return successResponse(res, 'Recurring transaction deleted successfully', { id: deleted._id });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new RecurringController();
