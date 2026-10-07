const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: [50, 'Category name cannot exceed 50 characters']
    },
    type: {
      type: String,
      required: [true, 'Category type is required'],
      enum: {
        values: ['income', 'expense'],
        message: 'Category type must be either income or expense'
      }
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
      default: ''
    },
    icon: {
      type: String,
      trim: true,
      default: 'tag'
    },
    color: {
      type: String,
      trim: true,
      default: '#64748B'
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

// Prevent duplicate category names for the same user and transaction type
categorySchema.index({ userId: 1, name: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);
