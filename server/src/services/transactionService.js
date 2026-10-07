const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const Budget = require('../models/Budget');
const { buildTransactionQuery, buildSortOptions } = require('../utils/queryHelpers');
const { checkAndCreateNotifications } = require('../utils/notificationHelper');

class TransactionService {
  /**
   * Get paginated transactions with filters, search, and sorting scoped to user
   */
  async getTransactions(queryParams, userId) {
    const page = parseInt(queryParams.page, 10) || 1;
    const limit = parseInt(queryParams.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = buildTransactionQuery(queryParams, userId);
    const sortOptions = buildSortOptions(queryParams.sort || queryParams.sortBy);

    const [transactions, totalItems] = await Promise.all([
      Transaction.find(query)
        .populate('category', 'name type icon color')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Transaction.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalItems / limit) || 1;

    return {
      transactions,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        limit
      }
    };
  }

  /**
   * Get single transaction by ID scoped to user
   */
  async getTransactionById(id, userId) {
    const transaction = await Transaction.findOne({ _id: id, userId }).populate('category', 'name type icon color');
    if (!transaction) {
      const error = new Error('Transaction not found');
      error.statusCode = 404;
      throw error;
    }
    return transaction;
  }

  /**
   * Create new transaction scoped to user and trigger notifications if thresholds met
   */
  async createTransaction(transactionData, userId) {
    // Verify category exists, belongs to user, and matches transaction type
    const category = await Category.findOne({ _id: transactionData.category, userId });
    if (!category) {
      const error = new Error('Selected category does not exist');
      error.statusCode = 400;
      throw error;
    }

    if (category.type !== transactionData.type) {
      const error = new Error(`Category type (${category.type}) does not match transaction type (${transactionData.type})`);
      error.statusCode = 400;
      throw error;
    }

    const transaction = new Transaction({
      ...transactionData,
      userId
    });
    await transaction.save();

    // Check for budget alerts if this was an expense
    let budgetSpent = undefined;
    let budgetTotal = undefined;
    if (transaction.type === 'expense') {
      const now = new Date(transaction.date || Date.now());
      const budget = await Budget.findOne({
        userId,
        category: category._id,
        month: now.getMonth() + 1,
        year: now.getFullYear()
      });

      if (budget) {
        budgetTotal = budget.amount;
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        const spentAgg = await Transaction.aggregate([
          {
            $match: {
              userId,
              category: category._id,
              type: 'expense',
              date: { $gte: startOfMonth, $lte: endOfMonth }
            }
          },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        budgetSpent = spentAgg[0] ? spentAgg[0].total : transaction.amount;
      }
    }

    // Trigger async background notification check
    checkAndCreateNotifications({
      userId,
      type: transaction.type,
      amount: transaction.amount,
      categoryName: category.name,
      budgetSpent,
      budgetTotal
    });

    return await Transaction.findById(transaction._id).populate('category', 'name type icon color');
  }

  /**
   * Update transaction by ID scoped to user
   */
  async updateTransaction(id, transactionData, userId) {
    const transaction = await Transaction.findOne({ _id: id, userId });
    if (!transaction) {
      const error = new Error('Transaction not found');
      error.statusCode = 404;
      throw error;
    }

    const targetType = transactionData.type || transaction.type;
    const targetCategoryId = transactionData.category || transaction.category;

    if (transactionData.category || transactionData.type) {
      const category = await Category.findOne({ _id: targetCategoryId, userId });
      if (!category) {
        const error = new Error('Selected category does not exist');
        error.statusCode = 400;
        throw error;
      }
      if (category.type !== targetType) {
        const error = new Error(`Category type (${category.type}) does not match transaction type (${targetType})`);
        error.statusCode = 400;
        throw error;
      }
    }

    Object.assign(transaction, transactionData);
    await transaction.save();
    return await Transaction.findById(id).populate('category', 'name type icon color');
  }

  /**
   * Delete transaction by ID scoped to user
   */
  async deleteTransaction(id, userId) {
    const transaction = await Transaction.findOne({ _id: id, userId });
    if (!transaction) {
      const error = new Error('Transaction not found');
      error.statusCode = 404;
      throw error;
    }
    await Transaction.findByIdAndDelete(id);
    return transaction;
  }

  /**
   * Export all transactions for user as CSV string
   */
  async exportTransactionsCSV(userId) {
    const transactions = await Transaction.find({ userId })
      .populate('category', 'name')
      .sort({ date: -1 })
      .lean();

    const headers = ['Date', 'Type', 'Description', 'Category', 'Payment Method', 'Amount', 'Notes'];
    const rows = transactions.map(t => {
      const d = t.date ? new Date(t.date).toISOString().split('T')[0] : '';
      const type = t.type || '';
      const desc = `"${(t.description || '').replace(/"/g, '""')}"`;
      const cat = `"${(t.category?.name || 'Uncategorized').replace(/"/g, '""')}"`;
      const method = t.paymentMethod || '';
      const amount = t.amount || 0;
      const notes = `"${(t.notes || '').replace(/"/g, '""')}"`;
      return [d, type, desc, cat, method, amount, notes].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }
}

module.exports = new TransactionService();
