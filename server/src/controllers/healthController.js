const { successResponse } = require('../utils/apiResponse');
const mongoose = require('mongoose');

/**
 * Health check controller
 * GET /api/health
 */
const getHealthStatus = (req, res) => {
  const dbStateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  const dbStatus = dbStateMap[mongoose.connection.readyState] || 'unknown';

  return successResponse(res, 'SpendWise API is running smoothly', {
    status: 'UP',
    database: dbStatus,
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  getHealthStatus
};
