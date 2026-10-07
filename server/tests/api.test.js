const request = require('supertest');
const app = require('../src/app');
const { connectDB, disconnectDB } = require('../src/config/database');
const Category = require('../src/models/Category');
const Transaction = require('../src/models/Transaction');

let testIncomeCategory;
let testExpenseCategory;
let createdTransactionId;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.USE_MEMORY_DB = 'true';
  await connectDB();

  await Category.deleteMany({});
  await Transaction.deleteMany({});

  // Seed sample categories for test environment
  testIncomeCategory = await Category.create({
    name: 'Test Salary',
    type: 'income',
    description: 'Test Income Category',
    icon: 'briefcase',
    color: '#10B981'
  });

  testExpenseCategory = await Category.create({
    name: 'Test Food',
    type: 'expense',
    description: 'Test Expense Category',
    icon: 'utensils',
    color: '#EF4444'
  });
});

afterAll(async () => {
  await disconnectDB();
});

describe('1. Health API', () => {
  test('GET /api/health - should return 200 and success status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('SpendWise API is running');
  });
});

describe('2. Category APIs', () => {
  let createdCatId;

  test('GET /api/categories - should return category list', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
  });

  test('GET /api/categories?type=income - should filter by income type', async () => {
    const res = await request(app).get('/api/categories?type=income');
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.every(c => c.type === 'income')).toBe(true);
  });

  test('POST /api/categories - should create a new category', async () => {
    const res = await request(app)
      .post('/api/categories')
      .send({
        name: 'Test Shopping',
        type: 'expense',
        description: 'Retail & clothes',
        icon: 'shopping-bag',
        color: '#EC4899'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Test Shopping');
    createdCatId = res.body.data._id;
  });

  test('POST /api/categories - should fail on duplicate name for same type', async () => {
    const res = await request(app)
      .post('/api/categories')
      .send({
        name: 'Test Shopping',
        type: 'expense'
      });

    expect(res.statusCode).toEqual(409);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/categories/:id - should return single category', async () => {
    const res = await request(app).get(`/api/categories/${createdCatId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.data._id).toBe(createdCatId);
  });

  test('PUT /api/categories/:id - should update category', async () => {
    const res = await request(app)
      .put(`/api/categories/${createdCatId}`)
      .send({
        name: 'Updated Test Shopping',
        color: '#111111'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.name).toBe('Updated Test Shopping');
  });

  test('DELETE /api/categories/:id - should delete unused category', async () => {
    const res = await request(app).delete(`/api/categories/${createdCatId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
  });
});

describe('3. Transaction CRUD & Validation APIs', () => {
  test('POST /api/transactions - should create income transaction', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .send({
        type: 'income',
        amount: 50000,
        category: testIncomeCategory._id,
        description: 'Monthly Salary Credit',
        date: new Date().toISOString(),
        paymentMethod: 'Bank Transfer',
        notes: 'September Salary'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.amount).toBe(50000);
    createdTransactionId = res.body.data._id;
  });

  test('POST /api/transactions - should create expense transaction', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .send({
        type: 'expense',
        amount: 3500,
        category: testExpenseCategory._id,
        description: 'Grocery Shopping',
        date: new Date().toISOString(),
        paymentMethod: 'Card',
        notes: 'Organic veggies and fruits'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.amount).toBe(3500);
  });

  test('POST /api/transactions - should fail validation on negative amount', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .send({
        type: 'expense',
        amount: -50,
        category: testExpenseCategory._id,
        description: 'Bad amount'
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/transactions - should return paginated list', async () => {
    const res = await request(app).get('/api/transactions?page=1&limit=10');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.pagination.currentPage).toBe(1);
    expect(res.body.data.transactions.length).toBeGreaterThanOrEqual(2);
  });

  test('GET /api/transactions/:id - should get transaction by ID', async () => {
    const res = await request(app).get(`/api/transactions/${createdTransactionId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.data._id).toBe(createdTransactionId);
  });

  test('GET /api/transactions/:id - should return 400 for invalid ObjectId format', async () => {
    const res = await request(app).get('/api/transactions/invalid-object-id-123');
    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/transactions/:id - should return 404 for non-existent ObjectId', async () => {
    const nonExistentId = '507f1f77bcf86cd799439011';
    const res = await request(app).get(`/api/transactions/${nonExistentId}`);
    expect(res.statusCode).toEqual(404);
    expect(res.body.success).toBe(false);
  });

  test('PUT /api/transactions/:id - should update transaction', async () => {
    const res = await request(app)
      .put(`/api/transactions/${createdTransactionId}`)
      .send({
        amount: 55000,
        description: 'Updated Monthly Salary Credit'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.amount).toBe(55000);
    expect(res.body.data.description).toBe('Updated Monthly Salary Credit');
  });

  test('GET /api/transactions filtering - expense + category', async () => {
    const res = await request(app).get(`/api/transactions?type=expense&category=${testExpenseCategory._id}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.transactions.every(t => t.type === 'expense' && t.category._id === testExpenseCategory._id.toString())).toBe(true);
  });

  test('GET /api/transactions filtering - expense + date range', async () => {
    const today = new Date().toISOString().split('T')[0];
    const res = await request(app).get(`/api/transactions?type=expense&startDate=${today}&endDate=${today}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.transactions.every(t => t.type === 'expense')).toBe(true);
  });

  test('GET /api/transactions filtering - income + date range', async () => {
    const today = new Date().toISOString().split('T')[0];
    const res = await request(app).get(`/api/transactions?type=income&startDate=${today}&endDate=${today}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.transactions.every(t => t.type === 'income')).toBe(true);
  });

  test('GET /api/transactions filtering - category + pagination', async () => {
    const res = await request(app).get(`/api/transactions?category=${testIncomeCategory._id}&page=1&limit=5`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.pagination.currentPage).toBe(1);
    expect(res.body.data.pagination.limit).toBe(5);
    expect(res.body.data.pagination).toHaveProperty('totalPages');
    expect(res.body.data.pagination).toHaveProperty('totalItems');
  });

  test('GET /api/transactions filtering - search + pagination', async () => {
    const res = await request(app).get('/api/transactions?search=Salary&page=1&limit=5');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.pagination.currentPage).toBe(1);
    expect(res.body.data.transactions.length).toBeGreaterThanOrEqual(1);
  });

  test('GET /api/transactions filtering - amount range + sorting', async () => {
    const res = await request(app).get('/api/transactions?minAmount=1000&maxAmount=100000&sort=amount_desc');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    const amounts = res.body.data.transactions.map(t => t.amount);
    const isSortedDesc = amounts.every((val, i) => i === 0 || amounts[i - 1] >= val);
    expect(isSortedDesc).toBe(true);
  });

  test('DELETE /api/transactions/:id - should delete transaction', async () => {
    const res = await request(app).delete(`/api/transactions/${createdTransactionId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
  });
});

describe('4. Aggregation Analytics APIs', () => {
  beforeAll(async () => {
    // Populate transactions for analytics testing
    await Transaction.create([
      {
        type: 'income',
        amount: 100000,
        category: testIncomeCategory._id,
        description: 'Tech Salary',
        date: new Date(),
        paymentMethod: 'Bank Transfer'
      },
      {
        type: 'expense',
        amount: 20000,
        category: testExpenseCategory._id,
        description: 'Rent',
        date: new Date(),
        paymentMethod: 'Bank Transfer'
      },
      {
        type: 'expense',
        amount: 5000,
        category: testExpenseCategory._id,
        description: 'Dining',
        date: new Date(),
        paymentMethod: 'Card'
      }
    ]);
  });

  test('GET /api/analytics/dashboard - should return total income, total expense, balance', async () => {
    const res = await request(app).get('/api/analytics/dashboard');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalIncome).toBeGreaterThan(0);
    expect(res.body.data.totalExpense).toBeGreaterThan(0);
    expect(res.body.data.balance).toBe(res.body.data.totalIncome - res.body.data.totalExpense);
  });

  test('GET /api/analytics/monthly - should return monthly summary stats', async () => {
    const now = new Date();
    const res = await request(app).get(`/api/analytics/monthly?year=${now.getFullYear()}&month=${now.getMonth() + 1}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.transactionCount).toBeGreaterThan(0);
    expect(res.body.data.highestExpense).toBe(20000);
  });

  test('GET /api/analytics/yearly - should return annual totals and 12-month breakdown', async () => {
    const now = new Date();
    const res = await request(app).get(`/api/analytics/yearly?year=${now.getFullYear()}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.monthlyBreakdown.length).toBe(12);
  });

  test('GET /api/analytics/category-expenses - should return grouped expense totals', async () => {
    const res = await request(app).get('/api/analytics/category-expenses');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('GET /api/analytics/income-vs-expense - should return time series comparison', async () => {
    const res = await request(app).get('/api/analytics/income-vs-expense');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
