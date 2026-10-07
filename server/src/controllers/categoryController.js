const categoryService = require('../services/categoryService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

class CategoryController {
  async getCategories(req, res, next) {
    try {
      const { type } = req.query;
      const categories = await categoryService.getCategories(type, req.user._id);
      return successResponse(res, 'Categories retrieved successfully', categories);
    } catch (error) {
      next(error);
    }
  }

  async getCategoryById(req, res, next) {
    try {
      const category = await categoryService.getCategoryById(req.params.id, req.user._id);
      if (!category) {
        return errorResponse(res, 'Category not found', [], 404);
      }
      return successResponse(res, 'Category retrieved successfully', category);
    } catch (error) {
      next(error);
    }
  }

  async createCategory(req, res, next) {
    try {
      const newCategory = await categoryService.createCategory(req.body, req.user._id);
      return successResponse(res, 'Category created successfully', newCategory, 201);
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req, res, next) {
    try {
      const updatedCategory = await categoryService.updateCategory(req.params.id, req.body, req.user._id);
      return successResponse(res, 'Category updated successfully', updatedCategory);
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req, res, next) {
    try {
      const deletedCategory = await categoryService.deleteCategory(req.params.id, req.user._id);
      return successResponse(res, `Category '${deletedCategory.name}' deleted successfully`, { id: req.params.id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CategoryController();
