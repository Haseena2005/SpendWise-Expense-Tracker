const express = require('express');
const router = express.Router();
const savingsGoalController = require('../controllers/savingsGoalController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', savingsGoalController.getGoals);
router.post('/', savingsGoalController.createGoal);
router.put('/:id', savingsGoalController.updateGoal);
router.delete('/:id', savingsGoalController.deleteGoal);

module.exports = router;
