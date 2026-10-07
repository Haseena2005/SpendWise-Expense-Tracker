const mongoose = require('mongoose');
const Budget = require('../models/Budget');
const Category = require('../models/Category');
const Transaction = require('../models/Transaction');

class BudgetService {
  /**
   * Get all budgets for a user for a specific month and year with real-time spent calculation
   */
  async getBudgets(monthParam, yearParam, userId) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const now = new Date();
    const month = parseInt(monthParam, 10) || (now.getMonth() + 1);
    const year = parseInt(yearParam, 10) || now.getFullYear();

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    // Fetch user's budgets for this month/year
    const budgets = await Budget.find({
      userId: userObjectId,
      month,
      year
    }).populate('category', 'name type icon color');

    // Aggregate user's actual expenses for this month/year grouped by category
    const actualExpenses = await Transaction.aggregate([
      {
        $match: {
          userId: userObjectId,
          type: 'expense',
          date: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: '$category',
          spent: { $sum: '$amount' }
        }
      }
    ]);

    const expenseMap = {};
    actualExpenses.forEach((item) => {
      expenseMap[item._id.toString()] = item.spent;
    });

    let totalBudget = 0;
    let totalSpent = 0;

    const formattedBudgets = budgets.map((b) => {
      const categoryIdStr = b.category?._id?.toString() || b.category?.toString();
      const spent = expenseMap[categoryIdStr] ? Math.round(expenseMap[categoryIdStr] * 100) / 100 : 0;
      const amount = b.amount;
      const remaining = Math.round(Math.max(0, amount - spent) * 100) / 100;
      const progress = amount > 0 ? Math.min(Math.round((spent / amount) * 1000) / 10, 999) : 0;

      totalBudget += amount;
      totalSpent += spent;

      return {
        _id: b._id,
        category: b.category,
        amount,
        spent,
        remaining,
        progress,
        month: b.month,
        year: b.year,
        createdAt: b.createdAt
      };
    });

    totalBudget = Math.round(totalBudget * 100) / 100;
    totalSpent = Math.round(totalSpent * 100) / 100;
    const remainingBudget = Math.round(Math.max(0, totalBudget - totalSpent) * 100) / 100;
    const overallProgress = totalBudget > 0 ? Math.min(Math.round((totalSpent / totalBudget) * 1000) / 10, 999) : 0;

    return {
      month,
      year,
      totalBudget,
      totalSpent,
      remainingBudget,
      overallProgress,
      budgets: formattedBudgets
    };
  }

  /**
   * Create a new budget
   */
  async createBudget(budgetData, userId) {
    const { category: categoryId, amount, month, year } = budgetData;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Verify category exists and belongs to user
    const category = await Category.findOne({ _id: categoryId, userId: userObjectId });
    if (!category) {
      const error = new Error('Category not found');
      error.statusCode = 404;
      throw error;
    }

    if (category.type !== 'expense') {
      const error = new Error('Budgets can only be set for expense categories');
      error.statusCode = 400;
      throw error;
    }

    // Check for duplicate budget
    const existing = await Budget.findOne({
      userId: userObjectId,
      category: categoryId,
      month: parseInt(month, 10),
      year: parseInt(year, 10)
    });

    if (existing) {
      const error = new Error(`A budget for '${category.name}' already exists for ${month}/${year}`);
      error.statusCode = 409;
      throw error;
    }

    const budget = new Budget({
      userId: userObjectId,
      category: categoryId,
      amount: Number(amount),
      month: parseInt(month, 10),
      year: parseInt(year, 10)
    });

    await budget.save();
    return await Budget.findById(budget._id).populate('category', 'name type icon color');
  }

  /**
   * Update a budget
   */
  async updateBudget(id, updateData, userId) {
    const budget = await Budget.findOne({ _id: id, userId });
    if (!budget) {
      const error = new Error('Budget not found');
      error.statusCode = 404;
      throw error;
    }

    if (updateData.amount !== undefined) {
      budget.amount = Number(updateData.amount);
    }

    await budget.save();
    return await Budget.findById(budget._id).populate('category', 'name type icon color');
  }

  /**
   * Delete a budget
   */
  async deleteBudget(id, userId) {
    const budget = await Budget.findOne({ _id: id, userId });
    if (!budget) {
      const error = new Error('Budget not found');
      error.statusCode = 404;
      throw error;
    }

    await Budget.findByIdAndDelete(id);
    return budget;
  }
}

module.exports = new BudgetService();
