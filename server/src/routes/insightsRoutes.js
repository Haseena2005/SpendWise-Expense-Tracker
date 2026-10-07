const express = require('express');
const router = express.Router();
const insightsController = require('../controllers/insightsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', insightsController.getInsights);
router.get('/health-score', insightsController.getFinancialHealth);

module.exports = router;
