const mongoose = require('mongoose');

/**
 * Build Mongoose query object safely from Express request query parameters and user context
 */
const buildTransactionQuery = (queryParams, userId) => {
  const {
    type,
    category,
    startDate,
    endDate,
    paymentMethod,
    search,
    minAmount,
    maxAmount
  } = queryParams;

  const query = {};

  // User isolation
  if (userId) {
    query.userId = new mongoose.Types.ObjectId(userId);
  }

  // Filter by type (income or expense)
  if (type && ['income', 'expense'].includes(type.toLowerCase())) {
    query.type = type.toLowerCase();
  }

  // Filter by category ObjectId
  if (category && mongoose.Types.ObjectId.isValid(category)) {
    query.category = new mongoose.Types.ObjectId(category);
  }

  // Filter by payment method
  if (paymentMethod && ['Cash', 'Card', 'UPI', 'Bank Transfer', 'Other'].includes(paymentMethod)) {
    query.paymentMethod = paymentMethod;
  }

  // Date Range Filtering
  if (startDate || endDate) {
    query.date = {};
    if (startDate && !isNaN(Date.parse(startDate))) {
      query.date.$gte = new Date(startDate);
    }
    if (endDate && !isNaN(Date.parse(endDate))) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.date.$lte = end;
    }
  }

  // Amount Range Filtering
  if (minAmount !== undefined || maxAmount !== undefined) {
    query.amount = {};
    if (minAmount !== undefined && minAmount !== '' && !isNaN(Number(minAmount))) {
      query.amount.$gte = Number(minAmount);
    }
    if (maxAmount !== undefined && maxAmount !== '' && !isNaN(Number(maxAmount))) {
      query.amount.$lte = Number(maxAmount);
    }
  }

  // Text Search on description and notes (escaped for safety)
  if (search && typeof search === 'string' && search.trim() !== '') {
    const sanitizedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.$or = [
      { description: { $regex: sanitizedSearch, $options: 'i' } },
      { notes: { $regex: sanitizedSearch, $options: 'i' } }
    ];
  }

  return query;
};

/**
 * Build sort options object
 */
const buildSortOptions = (sortBy) => {
  switch (sortBy) {
    case 'oldest':
    case 'date_asc':
      return { date: 1, _id: 1 };
    case 'amount_desc':
    case 'highToLow':
      return { amount: -1, date: -1 };
    case 'amount_asc':
    case 'lowToHigh':
      return { amount: 1, date: -1 };
    case 'date_desc':
    case 'newest':
    default:
      return { date: -1, _id: -1 };
  }
};

module.exports = {
  buildTransactionQuery,
  buildSortOptions
};
