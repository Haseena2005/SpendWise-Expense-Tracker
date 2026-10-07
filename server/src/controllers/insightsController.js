const insightsService = require('../services/insightsService');
const { successResponse } = require('../utils/apiResponse');

class InsightsController {
  async getInsights(req, res, next) {
    try {
      const data = await insightsService.getInsights(req.user._id);
      return successResponse(res, 'Smart insights generated successfully', data);
    } catch (err) {
      next(err);
    }
  }

  async getFinancialHealth(req, res, next) {
    try {
      const data = await insightsService.getFinancialHealth(req.user._id);
      return successResponse(res, 'Financial health score computed successfully', data);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new InsightsController();
