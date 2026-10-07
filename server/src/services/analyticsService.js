const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');

class AnalyticsService {
  /**
   * GET /api/analytics/dashboard
   * Calculates total income, total expense, balance, current month income, and current month expense scoped to user
   */
  async getDashboardAnalytics(userId) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // All-time Totals Aggregation Pipeline for current user
    const overallTotals = await Transaction.aggregate([
      {
        $match: { userId: userObjectId }
      },
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    let totalIncome = 0;
    let totalExpense = 0;

    overallTotals.forEach(item => {
      if (item._id === 'income') totalIncome = item.totalAmount;
      if (item._id === 'expense') totalExpense = item.totalAmount;
    });

    const balance = totalIncome - totalExpense;

    // Current Month Totals Aggregation Pipeline for current user
    const currentMonthTotals = await Transaction.aggregate([
      {
        $match: {
          userId: userObjectId,
          date: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    let currentMonthIncome = 0;
    let currentMonthExpense = 0;

    currentMonthTotals.forEach(item => {
      if (item._id === 'income') currentMonthIncome = item.totalAmount;
      if (item._id === 'expense') currentMonthExpense = item.totalAmount;
    });

    return {
      totalIncome,
      totalExpense,
      balance,
      currentMonthIncome,
      currentMonthExpense,
      currentMonthExpenses: currentMonthExpense
    };
  }

  /**
   * GET /api/analytics/monthly
   * Calculates total income, total expenses, balance, count, highest, and average expense for a selected month & year scoped to user
   */
  async getMonthlyAnalytics(yearParam, monthParam, userId) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const now = new Date();
    const year = parseInt(yearParam, 10) || now.getFullYear();
    const month = parseInt(monthParam, 10) || (now.getMonth() + 1);

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const result = await Transaction.aggregate([
      {
        $match: {
          userId: userObjectId,
          date: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: '$type',
                totalAmount: { $sum: '$amount' },
                count: { $sum: 1 }
              }
            }
          ],
          expenseStats: [
            {
              $match: { type: 'expense' }
            },
            {
              $group: {
                _id: null,
                highestExpense: { $max: '$amount' },
                averageExpense: { $avg: '$amount' },
                expenseCount: { $sum: 1 }
              }
            }
          ],
          totalCount: [
            {
              $count: 'count'
            }
          ]
        }
      }
    ]);

    const facetData = result[0] || {};
    let totalIncome = 0;
    let totalExpense = 0;

    (facetData.totals || []).forEach(item => {
      if (item._id === 'income') totalIncome = item.totalAmount;
      if (item._id === 'expense') totalExpense = item.totalAmount;
    });

    const balance = totalIncome - totalExpense;
    const transactionCount = facetData.totalCount[0] ? facetData.totalCount[0].count : 0;
    const expenseStats = facetData.expenseStats[0] || {};
    const highestExpense = expenseStats.highestExpense || 0;
    const averageExpense = expenseStats.averageExpense ? Math.round(expenseStats.averageExpense * 100) / 100 : 0;

    return {
      year,
      month,
      income: totalIncome,
      expenses: totalExpense,
      totalIncome,
      totalExpense,
      balance,
      transactionCount,
      highestExpense,
      averageExpense
    };
  }

  /**
   * GET /api/analytics/yearly
   * Annual totals & monthly breakdown for selected year scoped to user
   */
  async getYearlyAnalytics(yearParam, userId) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const now = new Date();
    const year = parseInt(yearParam, 10) || now.getFullYear();

    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

    const monthlyAggregation = await Transaction.aggregate([
      {
        $match: {
          userId: userObjectId,
          date: { $gte: startOfYear, $lte: endOfYear }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: '$date' },
            type: '$type'
          },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const monthlyBreakdown = monthNames.map((name, index) => ({
      month: name,
      monthNumber: index + 1,
      income: 0,
      expense: 0,
      balance: 0
    }));

    let annualIncome = 0;
    let annualExpense = 0;

    monthlyAggregation.forEach(item => {
      const monthIdx = item._id.month - 1;
      if (monthIdx >= 0 && monthIdx < 12) {
        if (item._id.type === 'income') {
          monthlyBreakdown[monthIdx].income = item.totalAmount;
          annualIncome += item.totalAmount;
        } else if (item._id.type === 'expense') {
          monthlyBreakdown[monthIdx].expense = item.totalAmount;
          annualExpense += item.totalAmount;
        }
      }
    });

    monthlyBreakdown.forEach(m => {
      m.balance = m.income - m.expense;
    });

    const annualBalance = annualIncome - annualExpense;

    // Highest & lowest spending months
    let highestSpendingMonth = null;
    let lowestSpendingMonth = null;
    let maxExpense = -1;
    let minExpense = Infinity;

    monthlyBreakdown.forEach(m => {
      if (m.expense > maxExpense) {
        maxExpense = m.expense;
        highestSpendingMonth = { month: m.month, amount: m.expense };
      }
      if (m.expense < minExpense) {
        minExpense = m.expense;
        lowestSpendingMonth = { month: m.month, amount: m.expense };
      }
    });

    if (maxExpense <= 0) highestSpendingMonth = { month: 'None', amount: 0 };
    if (minExpense === Infinity) lowestSpendingMonth = { month: 'None', amount: 0 };

    return {
      year,
      annualIncome,
      annualExpense,
      annualExpenses: annualExpense,
      annualBalance,
      highestSpendingMonth,
      lowestSpendingMonth,
      monthlyBreakdown
    };
  }

  /**
   * GET /api/analytics/category-expenses
   * Expense totals grouped by category scoped to user
   */
  async getCategoryExpenses(startDateParam, endDateParam, userId) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const match = { userId: userObjectId, type: 'expense' };

    if (startDateParam || endDateParam) {
      match.date = {};
      if (startDateParam && !isNaN(Date.parse(startDateParam))) {
        match.date.$gte = new Date(startDateParam);
      }
      if (endDateParam && !isNaN(Date.parse(endDateParam))) {
        const end = new Date(endDateParam);
        end.setHours(23, 59, 59, 999);
        match.date.$lte = end;
      }
    }

    const categoryAggregation = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryDetails'
        }
      },
      { $unwind: '$categoryDetails' },
      {
        $project: {
          _id: 0,
          categoryId: '$_id',
          name: '$categoryDetails.name',
          color: '$categoryDetails.color',
          icon: '$categoryDetails.icon',
          totalAmount: 1,
          count: 1
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    const totalExpenseOverall = categoryAggregation.reduce((acc, curr) => acc + curr.totalAmount, 0);

    const formattedCategories = categoryAggregation.map(item => ({
      ...item,
      percentage: totalExpenseOverall > 0 ? Math.round((item.totalAmount / totalExpenseOverall) * 10000) / 100 : 0
    }));

    return formattedCategories;
  }

  /**
   * GET /api/analytics/income-vs-expense
   * Time series data comparing income vs expense per period scoped to user
   */
  async getIncomeVsExpenseAnalytics(startDateParam, endDateParam, userId) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const match = { userId: userObjectId };

    if (startDateParam || endDateParam) {
      match.date = {};
      if (startDateParam && !isNaN(Date.parse(startDateParam))) {
        match.date.$gte = new Date(startDateParam);
      }
      if (endDateParam && !isNaN(Date.parse(endDateParam))) {
        const end = new Date(endDateParam);
        end.setHours(23, 59, 59, 999);
        match.date.$lte = end;
      }
    } else {
      // Default to last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
      sixMonthsAgo.setDate(1);
      sixMonthsAgo.setHours(0, 0, 0, 0);
      match.date = { $gte: sixMonthsAgo };
    }

    const aggregation = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type'
          },
          totalAmount: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthMap = {};

    aggregation.forEach(item => {
      const key = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
      if (!monthMap[key]) {
        const dateObj = new Date(item._id.year, item._id.month - 1, 1);
        const label = dateObj.toLocaleString('default', { month: 'short', year: 'numeric' });
        monthMap[key] = { label, key, income: 0, expense: 0 };
      }
      if (item._id.type === 'income') {
        monthMap[key].income = item.totalAmount;
      } else if (item._id.type === 'expense') {
        monthMap[key].expense = item.totalAmount;
      }
    });

    const series = Object.values(monthMap).sort((a, b) => a.key.localeCompare(b.key));
    return series;
  }
}

module.exports = new AnalyticsService();
