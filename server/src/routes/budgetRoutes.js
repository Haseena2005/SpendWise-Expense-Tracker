const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const {
  createBudgetValidation,
  updateBudgetValidation,
  validateBudgetIdParam,
  budgetQueryValidation
} = require('../validators/budgetValidator');
const { validateRequest } = require('../middleware/validationMiddleware');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', budgetQueryValidation, validateRequest, budgetController.getBudgets);
router.post('/', createBudgetValidation, validateRequest, budgetController.createBudget);
router.put('/:id', updateBudgetValidation, validateRequest, budgetController.updateBudget);
router.delete('/:id', validateBudgetIdParam, validateRequest, budgetController.deleteBudget);

module.exports = router;
