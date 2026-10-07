const RecurringTransaction = require('../models/RecurringTransaction');

class RecurringService {
  async getRecurringTransactions(userId) {
    return await RecurringTransaction.find({ userId })
      .populate('category', 'name type icon color')
      .sort({ nextOccurrence: 1 })
      .lean();
  }

  async createRecurringTransaction(data, userId) {
    const recurring = new RecurringTransaction({
      ...data,
      userId
    });
    await recurring.save();
    return await RecurringTransaction.findById(recurring._id).populate('category', 'name type icon color');
  }

  async updateRecurringTransaction(id, data, userId) {
    const recurring = await RecurringTransaction.findOneAndUpdate(
      { _id: id, userId },
      data,
      { new: true }
    ).populate('category', 'name type icon color');

    if (!recurring) {
      const error = new Error('Recurring transaction not found');
      error.statusCode = 404;
      throw error;
    }
    return recurring;
  }

  async deleteRecurringTransaction(id, userId) {
    const recurring = await RecurringTransaction.findOneAndDelete({ _id: id, userId });
    if (!recurring) {
      const error = new Error('Recurring transaction not found');
      error.statusCode = 404;
      throw error;
    }
    return recurring;
  }
}

module.exports = new RecurringService();
