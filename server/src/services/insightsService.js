const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');

class InsightsService {
  async getInsights(userId) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
    const endOfCurrentMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);

    const startOfPrevMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfPrevMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

    // Current month totals & transactions
    const [currentMonthTotals, prevMonthTotals, topCategory, largestExpense, budgets] = await Promise.all([
      Transaction.aggregate([
        { $match: { userId: userObjectId, date: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth } } },
        { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),
      Transaction.aggregate([
        { $match: { userId: userObjectId, date: { $gte: startOfPrevMonth, $lte: endOfPrevMonth } } },
        { $group: { _id: '$type', total: { $sum: '$amount' } } }
      ]),
      Transaction.aggregate([
        { $match: { userId: userObjectId, type: 'expense', date: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth } } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
        { $sort: { total: -1 } },
        { $limit: 1 },
        { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'cat' } },
        { $unwind: '$cat' }
      ]),
      Transaction.findOne({ userId: userObjectId, type: 'expense', date: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth } })
        .sort({ amount: -1 })
        .populate('category', 'name')
        .lean(),
      Budget.find({ userId: userObjectId, month: currentMonth + 1, year: currentYear }).populate('category', 'name')
    ]);

    let currIncome = 0;
    let currExpense = 0;
    let totalTxCount = 0;
    currentMonthTotals.forEach(t => {
      if (t._id === 'income') currIncome = t.total;
      if (t._id === 'expense') {
        currExpense = t.total;
        totalTxCount += t.count;
      }
    });

    let prevExpense = 0;
    prevMonthTotals.forEach(t => {
      if (t._id === 'expense') prevExpense = t.total;
    });

    const insights = [];

    if (totalTxCount === 0 && currIncome === 0) {
      return [
        {
          id: 'welcome',
          type: 'info',
          icon: 'Sparkles',
          color: '#6366F1',
          title: 'Start Recording Activity',
          message: 'Add your first income and expense transactions to unlock real-time financial insights.'
        }
      ];
    }

    // 1. Savings Rate Insight
    if (currIncome > 0) {
      const savingsRate = Math.round(((currIncome - currExpense) / currIncome) * 100);
      if (savingsRate >= 30) {
        insights.push({
          id: 'savings-good',
          type: 'positive',
          icon: 'TrendingUp',
          color: '#10B981',
          title: 'Strong Savings Rate',
          message: `Your current savings rate is ${savingsRate}%. You are retaining a solid portion of your income this month.`
        });
      } else if (savingsRate >= 10) {
        insights.push({
          id: 'savings-moderate',
          type: 'neutral',
          icon: 'TrendingUp',
          color: '#F59E0B',
          title: 'Moderate Savings Rate',
          message: `Your savings rate is ${savingsRate}%. Try trimming non-essential expenses to reach the recommended 20-30% goal.`
        });
      } else if (savingsRate < 0) {
        insights.push({
          id: 'savings-negative',
          type: 'warning',
          icon: 'AlertTriangle',
          color: '#EF4444',
          title: 'Cashflow Deficit Alert',
          message: `Expenses currently exceed your income this month by ${(currExpense - currIncome).toLocaleString()}. Consider reviewing recent spending.`
        });
      }
    }

    // 2. Month-over-Month Trend
    if (prevExpense > 0 && currExpense > 0) {
      const diffPercent = Math.round(((currExpense - prevExpense) / prevExpense) * 100);
      if (diffPercent < 0) {
        insights.push({
          id: 'mom-improved',
          type: 'positive',
          icon: 'ArrowDownRight',
          color: '#10B981',
          title: 'Spending Reduced',
          message: `Your expenses decreased by ${Math.abs(diffPercent)}% compared with last month. Great job!`
        });
      } else if (diffPercent > 15) {
        insights.push({
          id: 'mom-increased',
          type: 'warning',
          icon: 'ArrowUpRight',
          color: '#EF4444',
          title: 'Spending Acceleration',
          message: `Your expenses increased by ${diffPercent}% compared to the previous month.`
        });
      }
    }

    // 3. Top Spending Category
    if (topCategory && topCategory.length > 0) {
      const topCat = topCategory[0];
      const catPercent = currExpense > 0 ? Math.round((topCat.total / currExpense) * 100) : 0;
      insights.push({
        id: 'top-cat',
        type: 'info',
        icon: 'PieChart',
        color: '#3B82F6',
        title: 'Top Spending Category',
        message: `${topCat.cat?.name} is your highest expense area, accounting for ${catPercent}% of total monthly spend.`
      });
    }

    // 4. Largest Single Expense
    if (largestExpense) {
      insights.push({
        id: 'largest-tx',
        type: 'info',
        icon: 'Receipt',
        color: '#8B5CF6',
        title: 'Largest Expense',
        message: `Your single largest expense this month was "${largestExpense.description}" (${largestExpense.amount.toLocaleString()}).`
      });
    }

    return insights;
  }

  async getFinancialHealth(userId) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);

    const [monthlyTotals, budgets, transactions] = await Promise.all([
      Transaction.aggregate([
        { $match: { userId: userObjectId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: '$type', total: { $sum: '$amount' } } }
      ]),
      Budget.find({ userId: userObjectId, month: currentMonth + 1, year: currentYear }),
      Transaction.find({ userId: userObjectId, date: { $gte: startOfMonth, $lte: endOfMonth } }).limit(50)
    ]);

    let income = 0;
    let expense = 0;
    monthlyTotals.forEach(t => {
      if (t._id === 'income') income = t.total;
      if (t._id === 'expense') expense = t.total;
    });

    if (income === 0 && expense === 0 && transactions.length === 0) {
      return {
        score: 0,
        status: 'No Data',
        tier: 'unknown',
        color: '#64748b',
        breakdown: {
          savingsScore: 0,
          budgetScore: 0,
          cashflowScore: 0
        },
        summary: 'Add income and expense transactions to calculate your personalized financial health score.',
        tips: [
          'Record recurring monthly income.',
          'Set category budgets to prevent unexpected overspending.'
        ]
      };
    }

    let score = 0;
    const tips = [];

    // Factor 1: Savings Rate (0 - 40 pts)
    let savingsScore = 0;
    if (income > 0) {
      const savingsRate = ((income - expense) / income) * 100;
      if (savingsRate >= 35) {
        savingsScore = 40;
      } else if (savingsRate >= 20) {
        savingsScore = 32;
      } else if (savingsRate >= 10) {
        savingsScore = 24;
      } else if (savingsRate > 0) {
        savingsScore = 15;
      } else {
        savingsScore = 0;
        tips.push('Your expenses exceed your current monthly income. Prioritize cutting non-essential costs.');
      }
    } else if (expense === 0) {
      savingsScore = 25;
    } else {
      savingsScore = 10;
      tips.push('Record your regular income sources to balance your cashflow ratio.');
    }
    score += savingsScore;

    // Factor 2: Budget Adherence (0 - 35 pts)
    let budgetScore = 35;
    if (budgets.length > 0) {
      // Check spent per category
      const expenseByCategory = {};
      transactions.filter(t => t.type === 'expense').forEach(t => {
        const catId = t.category.toString();
        expenseByCategory[catId] = (expenseByCategory[catId] || 0) + t.amount;
      });

      let exceededCount = 0;
      budgets.forEach(b => {
        const spent = expenseByCategory[b.category.toString()] || 0;
        if (spent > b.amount) exceededCount++;
      });

      if (exceededCount === 0) {
        budgetScore = 35;
      } else if (exceededCount === 1) {
        budgetScore = 20;
        tips.push('One of your monthly category budgets has been exceeded.');
      } else {
        budgetScore = 10;
        tips.push('Multiple category budgets are over limit. Review your budget targets.');
      }
    } else {
      budgetScore = 25; // Default neutral if no budgets yet
      tips.push('Setting category budgets will increase your health score and financial discipline.');
    }
    score += budgetScore;

    // Factor 3: Cashflow & Activity Stability (0 - 25 pts)
    let cashflowScore = 0;
    if (income >= expense && income > 0) {
      cashflowScore = 25;
    } else if (expense === 0) {
      cashflowScore = 20;
    } else {
      cashflowScore = 5;
    }
    score += cashflowScore;

    score = Math.min(Math.max(Math.round(score), 10), 100);

    let status = 'Good';
    let tier = 'good';
    let color = '#10B981';
    let summary = 'Your finances are well-managed with steady cashflow and healthy habits.';

    if (score >= 90) {
      status = 'Excellent';
      tier = 'excellent';
      color = '#10B981';
      summary = 'Outstanding financial discipline! You have strong savings and high budget adherence.';
    } else if (score >= 75) {
      status = 'Good';
      tier = 'good';
      color = '#10B981';
      summary = 'Your spending is well within limits and your financial habits are healthy.';
    } else if (score >= 60) {
      status = 'Fair';
      tier = 'fair';
      color = '#F59E0B';
      summary = 'Your finances are balanced, with room to optimize savings and budget tracking.';
    } else if (score >= 40) {
      status = 'Needs Attention';
      tier = 'warning';
      color = '#F97316';
      summary = 'Spending is close to or exceeding income. Consider tightening discretionary expenses.';
    } else {
      status = 'Critical';
      tier = 'critical';
      color = '#EF4444';
      summary = 'Significant cashflow deficits detected. Review expenses immediately.';
    }

    if (tips.length === 0) {
      tips.push('Maintain your current savings pace to build your emergency and investment funds.');
    }

    return {
      score,
      status,
      tier,
      color,
      breakdown: {
        savingsScore,
        budgetScore,
        cashflowScore
      },
      summary,
      tips
    };
  }
}

module.exports = new InsightsService();
