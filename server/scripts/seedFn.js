const Category = require('../src/models/Category');
const Transaction = require('../src/models/Transaction');
const User = require('../src/models/User');
const Budget = require('../src/models/Budget');

const defaultCategories = [
  { name: 'Salary',       type: 'income',  description: 'Monthly job salary and bonuses',               icon: 'Briefcase',   color: '#10B981' },
  { name: 'Freelance',    type: 'income',  description: 'Freelance work and client projects',            icon: 'Laptop',      color: '#3B82F6' },
  { name: 'Investments',  type: 'income',  description: 'Stock returns, interest, and dividends',        icon: 'TrendingUp',  color: '#8B5CF6' },
  { name: 'Side Business',type: 'income',  description: 'Side hustle and e-commerce revenue',            icon: 'Store',       color: '#F59E0B' },
  { name: 'Gifts & Grants',type: 'income', description: 'Gifts, refunds, and miscellaneous income',      icon: 'Gift',        color: '#EC4899' },
  { name: 'Food & Dining',type: 'expense', description: 'Groceries, restaurants, and dining out',        icon: 'Utensils',    color: '#EF4444' },
  { name: 'Housing & Rent',type: 'expense',description: 'Apartment rent and maintenance fees',            icon: 'Home',        color: '#3B82F6' },
  { name: 'Transportation',type: 'expense',description: 'Fuel, cab fares, and vehicle care',             icon: 'Car',         color: '#F59E0B' },
  { name: 'Utilities',    type: 'expense', description: 'Electricity, water, internet, and mobile',      icon: 'Zap',         color: '#8B5CF6' },
  { name: 'Entertainment',type: 'expense', description: 'Movies, streaming, games, and events',          icon: 'Film',        color: '#EC4899' },
  { name: 'Shopping',     type: 'expense', description: 'Clothing, electronics, and personal items',     icon: 'ShoppingBag', color: '#10B981' },
  { name: 'Healthcare',   type: 'expense', description: 'Medicines, doctors, and health insurance',      icon: 'HeartPulse',  color: '#14B8A6' },
  { name: 'Personal Care',type: 'expense', description: 'Grooming, fitness, and wellness',               icon: 'Sparkles',    color: '#F97316' },
  { name: 'Education',    type: 'expense', description: 'Books, courses, tuition, and certifications',   icon: 'GraduationCap',color: '#6366F1' },
  { name: 'Travel',       type: 'expense', description: 'Flights, hotels, and vacation trips',           icon: 'Plane',       color: '#06B6D4' }
];

const generateSeedData = (categoriesMap, userId) => {
  const transactions = [];
  const now = new Date(); // Current date: e.g. Oct 5, 2026

  // Helper to guarantee strictly historical dates (<= now)
  const getHistoricalDate = (monthsAgo, dayOffset = 0) => {
    const targetMonthDate = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
    const maxDaysInMonth = new Date(targetMonthDate.getFullYear(), targetMonthDate.getMonth() + 1, 0).getDate();
    
    let day = Math.min(Math.max(1, (dayOffset % maxDaysInMonth) + 1), maxDaysInMonth);
    
    // If it's the current month (monthsAgo === 0), ensure day <= current day
    if (monthsAgo === 0) {
      day = Math.min(day, Math.max(1, now.getDate() - 1));
    }

    const d = new Date(targetMonthDate.getFullYear(), targetMonthDate.getMonth(), day);
    d.setHours(Math.floor(Math.random() * 10) + 9, Math.floor(Math.random() * 59));
    return d;
  };

  const incomeTemplates = [
    { desc: 'TechCorp Monthly Salary',          cat: 'Salary',       min: 75000, max: 85000, method: 'Bank Transfer' },
    { desc: 'Web Development Client Project',   cat: 'Freelance',    min: 25000, max: 40000, method: 'UPI' },
    { desc: 'Monthly Salary Payout',            cat: 'Salary',       min: 75000, max: 85000, method: 'Bank Transfer' },
    { desc: 'E-commerce Store Revenue Share',   cat: 'Side Business',min: 18000, max: 30000, method: 'Bank Transfer' },
    { desc: 'Mutual Fund Quarterly Dividend',   cat: 'Investments',  min:  5000, max: 12000, method: 'Bank Transfer' },
    { desc: 'UI/UX Design Consultation',        cat: 'Freelance',    min: 15000, max: 28000, method: 'UPI' },
    { desc: 'Stock Dividend Payout',            cat: 'Investments',  min:  4000, max:  9000, method: 'Bank Transfer' },
    { desc: 'Software Consulting Milestone 2',  cat: 'Freelance',    min: 30000, max: 45000, method: 'Bank Transfer' },
    { desc: 'Birthday Cash Gift',               cat: 'Gifts & Grants',min: 2000, max:  5000, method: 'Cash' },
    { desc: 'Side Business Profits',            cat: 'Side Business',min: 22000, max: 35000, method: 'Bank Transfer' },
    { desc: 'Monthly Salary Credit',            cat: 'Salary',       min: 75000, max: 85000, method: 'Bank Transfer' },
    { desc: 'Tax Refund Payout',                cat: 'Gifts & Grants',min: 8000, max: 15000, method: 'Bank Transfer' },
  ];

  incomeTemplates.forEach((t, i) => {
    const catObj = categoriesMap[`income:${t.cat}`];
    if (catObj) {
      transactions.push({
        userId,
        type: 'income',
        amount: Math.floor(Math.random() * (t.max - t.min + 1)) + t.min,
        category: catObj._id,
        description: t.desc,
        date: getHistoricalDate(i % 5, (i * 7) + 3),
        paymentMethod: t.method,
        notes: `Verified credit for ${t.cat}`
      });
    }
  });

  const expenseTemplates = [
    { desc: 'Supermarket Grocery Shopping',  cat: 'Food & Dining',   min:  2500, max:  6500, method: 'Card' },
    { desc: 'Swiggy Dinner Order',           cat: 'Food & Dining',   min:   450, max:  1200, method: 'UPI' },
    { desc: 'Petrol Fuel Fill-up',           cat: 'Transportation',  min:  1500, max:  3000, method: 'Card' },
    { desc: 'Uber Ride to Airport',          cat: 'Transportation',  min:   800, max:  1800, method: 'UPI' },
    { desc: 'Nike Running Shoes',            cat: 'Shopping',        min:  4500, max:  8500, method: 'Card' },
    { desc: 'Amazon Electronics Purchase',   cat: 'Shopping',        min:  3000, max: 15000, method: 'Card' },
    { desc: 'Electricity Bill Payment',      cat: 'Utilities',       min:  1800, max:  4200, method: 'UPI' },
    { desc: 'High-speed Fiber Broadband',    cat: 'Utilities',       min:   999, max:  1499, method: 'UPI' },
    { desc: 'Udemy Full-stack Masterclass',  cat: 'Education',       min:   500, max:  3500, method: 'Card' },
    { desc: 'Technical Books Purchase',      cat: 'Education',       min:  1200, max:  2800, method: 'Card' },
    { desc: 'PVR Movie Tickets',             cat: 'Entertainment',   min:   600, max:  1500, method: 'UPI' },
    { desc: 'Netflix & Spotify Sub',         cat: 'Entertainment',   min:   649, max:   999, method: 'Card' },
    { desc: 'Pharmacy Medicine Purchase',    cat: 'Healthcare',      min:   450, max:  2500, method: 'UPI' },
    { desc: 'Annual Health Checkup',         cat: 'Healthcare',      min:  3500, max:  7000, method: 'Card' },
    { desc: 'Apartment Monthly Rent',        cat: 'Housing & Rent',  min: 22000, max: 25000, method: 'Bank Transfer' },
    { desc: 'Society Maintenance Charge',    cat: 'Housing & Rent',  min:  2500, max:  3500, method: 'Bank Transfer' },
    { desc: 'Zomato Lunch with Colleagues',  cat: 'Food & Dining',   min:   600, max:  1400, method: 'UPI' },
    { desc: 'Car Wash & Servicing',          cat: 'Transportation',  min:  2000, max:  4500, method: 'Cash' },
    { desc: 'Zara Clothing Shopping',        cat: 'Shopping',        min:  3500, max:  9000, method: 'Card' },
    { desc: 'Mobile Postpaid Monthly Bill',  cat: 'Utilities',       min:   699, max:  1199, method: 'UPI' },
    { desc: 'AWS Cloud Hosting Fees',        cat: 'Utilities',       min:  1200, max:  3800, method: 'Card' },
    { desc: 'Coursera Subscription Fee',     cat: 'Education',       min:  3200, max:  4800, method: 'Card' },
    { desc: 'Weekend Concert Event Ticket',  cat: 'Entertainment',   min:  1500, max:  4000, method: 'UPI' },
    { desc: 'Dental Checkup & Cleaning',     cat: 'Healthcare',      min:  1800, max:  3200, method: 'Card' },
    { desc: 'Personal Grooming & Spa',       cat: 'Personal Care',   min:  2000, max:  3500, method: 'Cash' },
    { desc: 'Weekly Fruit & Veggies Market', cat: 'Food & Dining',   min:   800, max:  1800, method: 'Cash' },
    { desc: 'Auto Rickshaw Commute',         cat: 'Transportation',  min:   150, max:   450, method: 'Cash' },
    { desc: 'Home Furniture Accessories',    cat: 'Shopping',        min:  2500, max:  7500, method: 'Card' },
    { desc: 'Water Purifier Maintenance',    cat: 'Utilities',       min:  1200, max:  2200, method: 'UPI' },
    { desc: 'Weekend Getaway Hotel Booking', cat: 'Travel',          min:  4500, max: 12000, method: 'Card' },
    { desc: 'Vitamin Supplements',           cat: 'Healthcare',      min:   850, max:  1900, method: 'UPI' },
    { desc: 'Apartment Monthly Rent',        cat: 'Housing & Rent',  min: 22000, max: 25000, method: 'Bank Transfer' },
    { desc: 'Coffee Shop Team Outing',       cat: 'Food & Dining',   min:   750, max:  1600, method: 'UPI' },
    { desc: 'Flight Tickets for Trip',       cat: 'Travel',          min:  6000, max: 14000, method: 'Card' },
    { desc: 'Haircut & Styling Session',     cat: 'Personal Care',   min:   600, max:  1400, method: 'UPI' },
  ];

  expenseTemplates.forEach((t, i) => {
    const catObj = categoriesMap[`expense:${t.cat}`];
    if (catObj) {
      transactions.push({
        userId,
        type: 'expense',
        amount: Math.floor(Math.random() * (t.max - t.min + 1)) + t.min,
        category: catObj._id,
        description: t.desc,
        date: getHistoricalDate(i % 5, (i * 5) + 1),
        paymentMethod: t.method,
        notes: `Paid via ${t.method}`
      });
    }
  });

  return transactions;
};

const seedDatabase = async () => {
  console.log('Seeding demo user and demo data...');

  // 1. Create or Find Demo User
  let demoUser = await User.findOne({ email: 'demo@spendwise.com' });
  if (!demoUser) {
    demoUser = await User.create({
      name: 'Demo User',
      email: 'demo@spendwise.com',
      password: 'Password123!'
    });
    console.log('Created demo user: demo@spendwise.com / Password123!');
  }

  // 2. Clear previous data belonging ONLY to demo user
  await Transaction.deleteMany({ userId: demoUser._id });
  await Budget.deleteMany({ userId: demoUser._id });
  await Category.deleteMany({ userId: demoUser._id });

  // 3. Seed demo categories
  const categoriesToInsert = defaultCategories.map(c => ({
    ...c,
    userId: demoUser._id
  }));
  const inserted = await Category.insertMany(categoriesToInsert);

  const categoriesMap = {};
  inserted.forEach(cat => {
    categoriesMap[`${cat.type}:${cat.name}`] = cat;
  });

  // 4. Seed demo transactions (strictly historical)
  const txData = generateSeedData(categoriesMap, demoUser._id);
  await Transaction.insertMany(txData);

  // 5. Seed sample demo budgets for current month & year
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const foodCat = categoriesMap['expense:Food & Dining'];
  const rentCat = categoriesMap['expense:Housing & Rent'];
  const transCat = categoriesMap['expense:Transportation'];
  const utilCat = categoriesMap['expense:Utilities'];
  const shopCat = categoriesMap['expense:Shopping'];

  const sampleBudgets = [];
  if (foodCat) sampleBudgets.push({ userId: demoUser._id, category: foodCat._id, amount: 15000, month: currentMonth, year: currentYear });
  if (rentCat) sampleBudgets.push({ userId: demoUser._id, category: rentCat._id, amount: 25000, month: currentMonth, year: currentYear });
  if (transCat) sampleBudgets.push({ userId: demoUser._id, category: transCat._id, amount: 8000, month: currentMonth, year: currentYear });
  if (utilCat) sampleBudgets.push({ userId: demoUser._id, category: utilCat._id, amount: 6000, month: currentMonth, year: currentYear });
  if (shopCat) sampleBudgets.push({ userId: demoUser._id, category: shopCat._id, amount: 12000, month: currentMonth, year: currentYear });

  if (sampleBudgets.length > 0) {
    await Budget.insertMany(sampleBudgets);
  }

  console.log(`✓ Seeded demo user with ${inserted.length} categories, ${txData.length} transactions, and ${sampleBudgets.length} budgets.`);
};

module.exports = { seedDatabase };
