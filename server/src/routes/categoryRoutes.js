const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const {
  createCategoryValidation,
  updateCategoryValidation,
  validateCategoryIdParam,
  categoryQueryValidation
} = require('../validators/categoryValidator');
const { validateRequest } = require('../middleware/validationMiddleware');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', categoryQueryValidation, validateRequest, categoryController.getCategories);
router.get('/:id', validateCategoryIdParam, validateRequest, categoryController.getCategoryById);
router.post('/', createCategoryValidation, validateRequest, categoryController.createCategory);
router.put('/:id', updateCategoryValidation, validateRequest, categoryController.updateCategory);
router.delete('/:id', validateCategoryIdParam, validateRequest, categoryController.deleteCategory);

module.exports = router;
