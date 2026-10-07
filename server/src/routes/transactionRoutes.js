const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const {
  createTransactionValidation,
  updateTransactionValidation,
  validateIdParam,
  queryValidation
} = require('../validators/transactionValidator');
const { validateRequest } = require('../middleware/validationMiddleware');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/export/csv', transactionController.exportCSV);
router.get('/', queryValidation, validateRequest, transactionController.getTransactions);
router.get('/:id', validateIdParam, validateRequest, transactionController.getTransactionById);
router.post('/', createTransactionValidation, validateRequest, transactionController.createTransaction);
router.put('/:id', updateTransactionValidation, validateRequest, transactionController.updateTransaction);
router.delete('/:id', validateIdParam, validateRequest, transactionController.deleteTransaction);

module.exports = router;
