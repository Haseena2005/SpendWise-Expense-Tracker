const SavingsGoal = require('../models/SavingsGoal');

class SavingsGoalService {
  async getGoals(userId) {
    const goals = await SavingsGoal.find({ userId }).sort({ createdAt: -1 }).lean();
    return goals.map(g => {
      const target = g.targetAmount || 1;
      const current = g.currentAmount || 0;
      const progress = Math.min(Math.round((current / target) * 100), 100);
      const remaining = Math.max(0, target - current);
      return {
        ...g,
        progress,
        remaining
      };
    });
  }

  async createGoal(data, userId) {
    const goal = new SavingsGoal({
      ...data,
      userId
    });
    return await goal.save();
  }

  async updateGoal(id, data, userId) {
    const goal = await SavingsGoal.findOne({ _id: id, userId });
    if (!goal) {
      const error = new Error('Savings goal not found');
      error.statusCode = 404;
      throw error;
    }

    Object.assign(goal, data);
    if (goal.currentAmount >= goal.targetAmount) {
      goal.isCompleted = true;
    } else {
      goal.isCompleted = false;
    }

    return await goal.save();
  }

  async deleteGoal(id, userId) {
    const goal = await SavingsGoal.findOneAndDelete({ _id: id, userId });
    if (!goal) {
      const error = new Error('Savings goal not found');
      error.statusCode = 404;
      throw error;
    }
    return goal;
  }
}

module.exports = new SavingsGoalService();
