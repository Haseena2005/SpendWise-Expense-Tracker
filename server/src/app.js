const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const healthRoutes = require('./routes/healthRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const profileRoutes = require('./routes/profileRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const savingsGoalRoutes = require('./routes/savingsGoalRoutes');
const recurringRoutes = require('./routes/recurringRoutes');
const insightsRoutes = require('./routes/insightsRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Security Middlewares
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin === clientUrl || process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rate Limiter to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});
app.use('/api', limiter);

// Body Parsers
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Safe Mongo Query Sanitization Middleware
app.use((req, res, next) => {
  const sanitize = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    for (const key of Object.keys(obj)) {
      if (key.startsWith('$') || key.includes('.')) {
        delete obj[key];
      } else if (typeof obj[key] === 'object') {
        sanitize(obj[key]);
      }
    }
  };
  sanitize(req.body);
  sanitize(req.params);
  next();
});

// API Root Route
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'SpendWise API is running',
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/savings-goals', savingsGoalRoutes);
app.use('/api/recurring-transactions', recurringRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/financial-health', insightsRoutes);

// Root route welcome message
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to SpendWise Personal Expense Tracker API',
    docs: '/api/health'
  });
});

// Centralized Error Handling Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
