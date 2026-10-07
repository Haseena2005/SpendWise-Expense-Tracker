const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const { connectDB, disconnectDB } = require('../src/config/database');
const Category = require('../src/models/Category');
const Transaction = require('../src/models/Transaction');

const defaultCategories = [
  // Income Categories
  { name: 'Salary', type: 'income', description: 'Monthly job salary and bonuses', icon: 'briefcase', color: '#10B981' },
  { name: 'Freelance', type: 'income', description: 'Freelance work and client projects', icon: 'laptop', color: '#3B82F6' },
  { name: 'Business', type: 'income', description: 'Business profits and dividends', icon: 'building', color: '#8B5CF6' },
  { name: 'Investment', type: 'income', description: 'Stock returns, interest, and crypto gains', icon: 'trending-up', color: '#06B6D4' },
  { name: 'Other Income', type: 'income', description: 'Gifts, refunds, and miscellaneous income', icon: 'plus-circle', color: '#14B8A6' },

  // Expense Categories
  { name: 'Food', type: 'expense', description: 'Groceries, restaurants, and dining out', icon: 'utensils', color: '#EF4444' },
  { name: 'Transport', type: 'expense', description: 'Fuel, cab fares, public transit, and car maintenance', icon: 'car', color: '#F59E0B' },
  { name: 'Shopping', type: 'expense', description: 'Clothing, electronics, and personal items', icon: 'shopping-bag', color: '#EC4899' },
  { name: 'Bills', type: 'expense', description: 'Electricity, water, internet, and mobile recharges', icon: 'file-text', color: '#6366F1' },
  { name: 'Education', type: 'expense', description: 'Books, courses, tuition fees, and certifications', icon: 'book-open', color: '#8B5CF6' },
  { name: 'Entertainment', type: 'expense', description: 'Movies, streaming services, games, and events', icon: 'film', color: '#A855F7' },
  { name: 'Healthcare', type: 'expense', description: 'Medicines, doctor visits, and health insurance', icon: 'heart-pulse', color: '#10B981' },
  { name: 'Rent', type: 'expense', description: 'Apartment rent and maintenance fees', icon: 'home', color: '#F97316' },
  { name: 'Other Expense', type: 'expense', description: 'Sundry expenses and emergency payouts', icon: 'minus-circle', color: '#64748B' }
];

const paymentMethods = ['Cash', 'Card', 'UPI', 'Bank Transfer', 'Other'];

const generateSeedData = (categoriesMap) => {
  const transactions = [];
  const now = new Date();

  // Helper for random date within past N months
  const getRandomDate = (monthsAgo) => {
    const d = new Date(now.getFullYear(), now.getMonth() - monthsAgo, Math.floor(Math.random() * 25) + 1);
    d.setHours(Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 59));
    return d;
  };

  // 12 Income Transactions spread across past 6 months
  const incomeTemplates = [
    { desc: 'TechCorp Monthly Salary', cat: 'Salary', min: 75000, max: 85000, method: 'Bank Transfer' },
    { desc: 'Web Development Client Project', cat: 'Freelance', min: 25000, max: 40000, method: 'UPI' },
    { desc: 'Monthly Salary Payout', cat: 'Salary', min: 75000, max: 85000, method: 'Bank Transfer' },
    { desc: 'E-commerce Store Revenue Share', cat: 'Business', min: 18000, max: 30000, method: 'Bank Transfer' },
    { desc: 'Mutual Fund Quarterly Dividend', cat: 'Investment', min: 5000, max: 12000, method: 'Bank Transfer' },
    { desc: 'UI/UX Design Consultation', cat: 'Freelance', min: 15000, max: 28000, method: 'UPI' },
    { desc: 'Stock Dividend Payout', cat: 'Investment', min: 4000, max: 9000, method: 'Bank Transfer' },
    { desc: 'Software Consulting Milestone 2', cat: 'Freelance', min: 30000, max: 45000, method: 'Bank Transfer' },
    { desc: 'Birthday Cash Gift', cat: 'Other Income', min: 2000, max: 5000, method: 'Cash' },
    { desc: 'Side Business Profits', cat: 'Business', min: 22000, max: 35000, method: 'Bank Transfer' },
    { desc: 'Monthly Salary Credit', cat: 'Salary', min: 75000, max: 85000, method: 'Bank Transfer' },
    { desc: 'Tax Refund Payout', cat: 'Other Income', min: 8000, max: 15000, method: 'Bank Transfer' }
  ];

  incomeTemplates.forEach((t, i) => {
    const monthsAgo = i % 6; // Spread over 6 months
    const catObj = categoriesMap[`income:${t.cat}`];
    if (catObj) {
      transactions.push({
        type: 'income',
        amount: Math.floor(Math.random() * (t.max - t.min + 1)) + t.min,
        category: catObj._id,
        description: t.desc,
        date: getRandomDate(monthsAgo),
        paymentMethod: t.method,
        notes: `Verified credit for ${t.cat}`
      });
    }
  });

  // 35 Expense Transactions spread across past 6 months
  const expenseTemplates = [
    { desc: 'Supermarket Grocery Shopping', cat: 'Food', min: 2500, max: 6500, method: 'Card' },
    { desc: 'Swiggy Dinner Order', cat: 'Food', min: 450, max: 1200, method: 'UPI' },
    { desc: 'Petrol Fuel Fill-up', cat: 'Transport', min: 1500, max: 3000, method: 'Card' },
    { desc: 'Uber Ride to Airport', cat: 'Transport', min: 800, max: 1800, method: 'UPI' },
    { desc: 'Nike Running Shoes', cat: 'Shopping', min: 4500, max: 8500, method: 'Card' },
    { desc: 'Amazon Electronics Purchase', cat: 'Shopping', min: 3000, max: 15000, method: 'Card' },
    { desc: 'Electricity Bill Payment', cat: 'Bills', min: 1800, max: 4200, method: 'UPI' },
    { desc: 'High-speed Fiber Broadband Bill', cat: 'Bills', min: 999, max: 1499, method: 'UPI' },
    { desc: 'Udemy Full-stack Masterclass', cat: 'Education', min: 500, max: 3500, method: 'Card' },
    { desc: 'Technical Books Purchase', cat: 'Education', min: 1200, max: 2800, method: 'Card' },
    { desc: 'PVR Multiplex Movie Tickets', cat: 'Entertainment', min: 600, max: 1500, method: 'UPI' },
    { desc: 'Netflix & Spotify Subscription', cat: 'Entertainment', min: 649, max: 999, method: 'Card' },
    { desc: 'Pharmacy Medicine Purchase', cat: 'Healthcare', min: 450, max: 2500, method: 'UPI' },
    { desc: 'Annual Health Checkup Clinic', cat: 'Healthcare', min: 3500, max: 7000, method: 'Card' },
    { desc: 'Apartment Monthly Rent', cat: 'Rent', min: 22000, max: 25000, method: 'Bank Transfer' },
    { desc: 'Society Maintenance Charge', cat: 'Rent', min: 2500, max: 3500, method: 'Bank Transfer' },
    { desc: 'Zomato Lunch with Colleagues', cat: 'Food', min: 600, max: 1400, method: 'UPI' },
    { desc: 'Car Wash & Servicing', cat: 'Transport', min: 2000, max: 4500, method: 'Cash' },
    { desc: 'Zara Clothing Shopping', cat: 'Shopping', min: 3500, max: 9000, method: 'Card' },
    { desc: 'Mobile Postpaid Monthly Bill', cat: 'Bills', min: 699, max: 1199, method: 'UPI' },
    { desc: 'AWS Cloud Hosting Fees', cat: 'Bills', min: 1200, max: 3800, method: 'Card' },
    { desc: 'Coursera Subscription Fee', cat: 'Education', min: 3200, max: 4800, method: 'Card' },
    { desc: 'Weekend Concert Event Ticket', cat: 'Entertainment', min: 1500, max: 4000, method: 'UPI' },
    { desc: 'Dental Checkup & Cleaning', cat: 'Healthcare', min: 1800, max: 3200, method: 'Card' },
    { desc: 'House Domestic Cleaning Aid', cat: 'Other Expense', min: 2000, max: 3500, method: 'Cash' },
    { desc: 'Weekly Fruit & Veggies Market', cat: 'Food', min: 800, max: 1800, method: 'Cash' },
    { desc: 'Auto Rickshaw Local Commute', cat: 'Transport', min: 150, max: 450, method: 'Cash' },
    { desc: 'Home Furniture Accessories', cat: 'Shopping', min: 2500, max: 7500, method: 'Card' },
    { desc: 'Water Purifier Maintenance', cat: 'Bills', min: 1200, max: 2200, method: 'UPI' },
    { desc: 'Gaming Console Headset', cat: 'Entertainment', min: 3500, max: 6500, method: 'Card' },
    { desc: 'Vitamin Supplements', cat: 'Healthcare', min: 850, max: 1900, method: 'UPI' },
    { desc: 'Apartment Monthly Rent', cat: 'Rent', min: 22000, max: 25000, method: 'Bank Transfer' },
    { desc: 'Coffee Shop Team Outing', cat: 'Food', min: 750, max: 1600, method: 'UPI' },
    { desc: 'Cab Ride to Client Meeting', cat: 'Transport', min: 450, max: 950, method: 'UPI' },
    { desc: 'Laundry & Dry Cleaning', cat: 'Other Expense', min: 600, max: 1400, method: 'Cash' }
  ];

  expenseTemplates.forEach((t, i) => {
    const monthsAgo = i % 6; // Spread across 6 months
    const catObj = categoriesMap[`expense:${t.cat}`];
    if (catObj) {
      transactions.push({
        type: 'expense',
        amount: Math.floor(Math.random() * (t.max - t.min + 1)) + t.min,
        category: catObj._id,
        description: t.desc,
        date: getRandomDate(monthsAgo),
        paymentMethod: t.method || paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        notes: `Paid via ${t.method}`
      });
    }
  });

  return transactions;
};

const seedDatabase = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await connectDB();

    console.log('Clearing existing Categories and Transactions...');
    await Transaction.deleteMany({});
    await Category.deleteMany({});

    console.log('Seeding Default Categories...');
    const insertedCategories = await Category.insertMany(defaultCategories);
    console.log(`Successfully seeded ${insertedCategories.length} categories.`);

    const categoriesMap = {};
    insertedCategories.forEach(cat => {
      categoriesMap[`${cat.type}:${cat.name}`] = cat;
    });

    console.log('Generating realistic Transactions...');
    const seedTransactions = generateSeedData(categoriesMap);

    console.log(`Seeding ${seedTransactions.length} Transactions...`);
    const insertedTransactions = await Transaction.insertMany(seedTransactions);
    console.log(`Successfully seeded ${insertedTransactions.length} transactions.`);

    console.log('Database Seeding Completed Successfully!');
  } catch (error) {
    console.error('Database Seeding Failed:', error);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
};

seedDatabase();
