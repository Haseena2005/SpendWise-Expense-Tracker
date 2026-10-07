const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required']
    },
    amount: {
      type: Number,
      required: [true, 'Budget amount is required'],
      min: [0.01, 'Budget amount must be greater than zero']
    },
    month: {
      type: Number,
      required: [true, 'Month is required'],
      min: [1, 'Month must be between 1 and 12'],
      max: [12, 'Month must be between 1 and 12']
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: [2000, 'Year must be a valid 4-digit year'],
      max: [2100, 'Year must be a valid 4-digit year']
    }
  },
  {
    timestamps: true
  }
);

// One budget per category per month per user
budgetSchema.index({ userId: 1, category: 1, month: 1, year: 1 }, { unique: true });
budgetSchema.index({ userId: 1, month: 1, year: 1 });

module.exports = mongoose.model('Budget', budgetSchema);
