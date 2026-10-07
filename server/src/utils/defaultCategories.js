const Category = require('../models/Category');

const DEFAULT_EXPENSE_CATEGORIES = [
  { name: 'Food & Dining', type: 'expense', description: 'Groceries, restaurants, and food delivery', icon: 'Utensils', color: '#EF4444' },
  { name: 'Housing & Rent', type: 'expense', description: 'Rent, mortgage, and property maintenance', icon: 'Home', color: '#3B82F6' },
  { name: 'Transportation', type: 'expense', description: 'Fuel, public transit, and vehicle care', icon: 'Car', color: '#F59E0B' },
  { name: 'Utilities', type: 'expense', description: 'Electricity, water, gas, and internet', icon: 'Zap', color: '#8B5CF6' },
  { name: 'Entertainment', type: 'expense', description: 'Movies, games, subscriptions, and events', icon: 'Film', color: '#EC4899' },
  { name: 'Shopping', type: 'expense', description: 'Clothing, gadgets, and general purchases', icon: 'ShoppingBag', color: '#10B981' },
  { name: 'Healthcare', type: 'expense', description: 'Doctor visits, pharmacy, and insurance', icon: 'HeartPulse', color: '#14B8A6' },
  { name: 'Personal Care', type: 'expense', description: 'Grooming, fitness, and wellness', icon: 'Sparkles', color: '#F97316' },
  { name: 'Education', type: 'expense', description: 'Courses, books, and tuition', icon: 'GraduationCap', color: '#6366F1' },
  { name: 'Travel', type: 'expense', description: 'Flights, hotels, and vacation trips', icon: 'Plane', color: '#06B6D4' }
];

const DEFAULT_INCOME_CATEGORIES = [
  { name: 'Salary', type: 'income', description: 'Monthly employment salary', icon: 'Briefcase', color: '#10B981' },
  { name: 'Freelance', type: 'income', description: 'Client projects and contract work', icon: 'Laptop', color: '#3B82F6' },
  { name: 'Investments', type: 'income', description: 'Dividends, capital gains, and interest', icon: 'TrendingUp', color: '#8B5CF6' },
  { name: 'Side Business', type: 'income', description: 'Side hustle and ecommerce revenue', icon: 'Store', color: '#F59E0B' },
  { name: 'Gifts & Grants', type: 'income', description: 'Monetary gifts, awards, and reimbursements', icon: 'Gift', color: '#EC4899' }
];

/**
 * Seed default categories for a new user
 * @param {string|ObjectId} userId
 */
async function seedDefaultCategoriesForUser(userId) {
  const categoriesToCreate = [
    ...DEFAULT_EXPENSE_CATEGORIES.map(c => ({ ...c, userId })),
    ...DEFAULT_INCOME_CATEGORIES.map(c => ({ ...c, userId }))
  ];

  return await Category.insertMany(categoriesToCreate);
}

module.exports = {
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
  seedDefaultCategoriesForUser
};
