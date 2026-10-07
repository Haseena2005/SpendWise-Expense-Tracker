const mongoose = require('mongoose');

const recurringTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    type: {
      type: String,
      required: [true, 'Transaction type is required'],
      enum: ['income', 'expense']
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than zero']
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 250
    },
    paymentMethod: {
      type: String,
      default: 'Bank Transfer'
    },
    frequency: {
      type: String,
      enum: ['weekly', 'monthly', 'yearly'],
      default: 'monthly'
    },
    nextOccurrence: {
      type: Date,
      required: [true, 'Next occurrence date is required']
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

recurringTransactionSchema.index({ userId: 1, nextOccurrence: 1 });

module.exports = mongoose.model('RecurringTransaction', recurringTransactionSchema);
