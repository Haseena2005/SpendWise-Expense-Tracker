const Category = require('../models/Category');
const Transaction = require('../models/Transaction');

class CategoryService {
  /**
   * Get all categories with optional type filtering for a user
   */
  async getCategories(type, userId) {
    const filter = { userId, isActive: true };
    if (type && ['income', 'expense'].includes(type.toLowerCase())) {
      filter.type = type.toLowerCase();
    }
    return await Category.find(filter).sort({ type: 1, name: 1 });
  }

  /**
   * Get single category by ID scoped to user
   */
  async getCategoryById(id, userId) {
    const category = await Category.findOne({ _id: id, userId });
    if (!category) {
      const error = new Error('Category not found');
      error.statusCode = 404;
      throw error;
    }
    return category;
  }

  /**
   * Create new category scoped to user
   */
  async createCategory(categoryData, userId) {
    const { name, type } = categoryData;
    const existing = await Category.findOne({
      userId,
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      type
    });

    if (existing) {
      const error = new Error(`Category '${name}' already exists for type '${type}'`);
      error.statusCode = 409;
      throw error;
    }

    const category = new Category({
      ...categoryData,
      userId
    });
    return await category.save();
  }

  /**
   * Update category by ID scoped to user
   */
  async updateCategory(id, categoryData, userId) {
    const category = await Category.findOne({ _id: id, userId });
    if (!category) {
      const error = new Error('Category not found');
      error.statusCode = 404;
      throw error;
    }

    if (categoryData.name || categoryData.type) {
      const newName = categoryData.name ? categoryData.name.trim() : category.name;
      const newType = categoryData.type || category.type;

      const duplicate = await Category.findOne({
        _id: { $ne: id },
        userId,
        name: { $regex: new RegExp(`^${newName}$`, 'i') },
        type: newType
      });

      if (duplicate) {
        const error = new Error(`Category '${newName}' already exists for type '${newType}'`);
        error.statusCode = 409;
        throw error;
      }
    }

    Object.assign(category, categoryData);
    return await category.save();
  }

  /**
   * Delete category by ID scoped to user
   * Checks if category is referenced by any transactions belonging to user
   */
  async deleteCategory(id, userId) {
    const category = await Category.findOne({ _id: id, userId });
    if (!category) {
      const error = new Error('Category not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if category is used in user's transactions
    const transactionCount = await Transaction.countDocuments({ category: id, userId });
    if (transactionCount > 0) {
      const error = new Error(
        `Cannot delete category '${category.name}' as it is referenced by ${transactionCount} transaction(s). Please reassign or delete those transactions first.`
      );
      error.statusCode = 400;
      throw error;
    }

    await Category.findByIdAndDelete(id);
    return category;
  }
}

module.exports = new CategoryService();
