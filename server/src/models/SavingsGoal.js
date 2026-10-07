const mongoose = require('mongoose');

const savingsGoalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    name: {
      type: String,
      required: [true, 'Goal name is required'],
      trim: true,
      maxlength: 80
    },
    targetAmount: {
      type: Number,
      required: [true, 'Target amount is required'],
      min: [1, 'Target amount must be at least 1']
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: [0, 'Current amount cannot be negative']
    },
    targetDate: {
      type: Date,
      required: [true, 'Target date is required']
    },
    description: {
      type: String,
      trim: true,
      maxlength: 300,
      default: ''
    },
    color: {
      type: String,
      default: '#10B981'
    },
    isCompleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

savingsGoalSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('SavingsGoal', savingsGoalSchema);
