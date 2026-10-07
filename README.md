# 💰 SpendWise — Personal Expense Tracker & Financial Analytics

> A full-stack MERN application for tracking personal income and expenses, managing financial categories, and visualising spending patterns through interactive analytics dashboards powered by MongoDB aggregation pipelines.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Problem Statement](#problem-statement)
- [Objectives](#objectives)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Folder Structure](#folder-structure)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Seed Data](#seed-data)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Security Measures](#security-measures)
- [Screenshots](#screenshots)
- [Future Enhancements](#future-enhancements)
- [License](#license)

---

## 🎯 Project Overview

**SpendWise** is a personal finance management application that enables users to:

- Record and categorise income and expense transactions
- Visualise financial data through interactive charts (Recharts)
- Analyse spending patterns via MongoDB aggregation pipelines
- Manage custom income and expense categories with icons and colours
- Filter, sort, search, and paginate transactions

All analytics computations (monthly totals, yearly breakdowns, category-wise expenses, income-vs-expense comparisons) are performed **server-side** using MongoDB's aggregation framework — the React frontend only displays the pre-computed results.

---

## 🔍 Problem Statement

Individuals often struggle to track daily income and expenses across multiple payment methods, making it difficult to understand spending patterns, identify areas of overspending, and maintain healthy financial habits. Existing solutions are often bloated, expensive, or lack proper data visualisation.

**SpendWise** addresses this by providing a clean, lightweight, self-hosted expense tracker with powerful analytics driven by MongoDB aggregation pipelines.

---

## 🎯 Objectives

1. **Build a complete RESTful API** with Express.js for managing transactions and categories
2. **Implement MongoDB aggregation pipelines** for server-side financial analytics
3. **Design an interactive dashboard** with Recharts for visual data representation
4. **Enforce comprehensive input validation** using express-validator
5. **Apply security best practices** including Helmet, CORS, rate limiting, and query sanitisation
6. **Create a responsive, modern UI** with a dark-theme design system
7. **Handle edge cases** such as duplicate categories, safe deletion, and referential integrity

---

## ✨ Features

### Transaction Management
- ✅ Create, Read, Update, Delete (CRUD) transactions
- ✅ Income and Expense type support
- ✅ Multiple payment methods (Cash, Card, UPI, Bank Transfer, Other)
- ✅ Advanced filtering (type, category, date range, amount range, payment method)
- ✅ Full-text search on description and notes
- ✅ Sorting (newest, oldest, highest amount, lowest amount)
- ✅ Server-side pagination with configurable page size
- ✅ Category validation (category type must match transaction type)

### Category Management
- ✅ Separate Income and Expense category panels
- ✅ Create, Edit, Delete categories
- ✅ Custom icons and colour selection
- ✅ Duplicate name prevention (case-insensitive, per type)
- ✅ Safe deletion — prevents deleting categories with linked transactions
- ✅ Meaningful error messages for deletion failures

### Analytics & Charts (Recharts)
- ✅ **Dashboard Overview** — Total income, expenses, balance, current month stats
- ✅ **Income vs Expense Chart** — Grouped bar chart with selectable time range (3M/6M/12M)
- ✅ **Expense by Category Chart** — Interactive donut/pie chart with percentage breakdown
- ✅ **Monthly Expense Trend** — Area chart with full-year breakdown, year selector
- ✅ **Yearly Financial Trend** — Net balance bar chart + monthly deep-dive stats with month/year selectors
- ✅ Loading skeletons, empty states, and API error handling on every chart

### Security & Validation
- ✅ Helmet.js for HTTP security headers
- ✅ CORS configuration with whitelisted origins
- ✅ Rate limiting (300 req/15 min per IP)
- ✅ express-validator for all request body, params, and query validation
- ✅ MongoDB query sanitisation (strips `$` and `.` operators)
- ✅ ObjectId validation on all ID parameters
- ✅ ISO 8601 date validation
- ✅ Numeric range validation
- ✅ Centralized error handling with Mongoose-specific handlers
- ✅ Production-safe error responses (no stack traces)
- ✅ Regex escaping for search queries

---

## 🛠 Technology Stack

| Layer        | Technology                                    |
|:-------------|:----------------------------------------------|
| **Frontend** | React 18, React Router 6, Recharts 2, Axios   |
| **Styling**  | Vanilla CSS (dark-theme design system)         |
| **Icons**    | Lucide React                                   |
| **Build**    | Vite 5                                         |
| **Backend**  | Node.js, Express.js 4                          |
| **Database** | MongoDB (Mongoose 8 ODM)                       |
| **Dev DB**   | mongodb-memory-server (in-memory, zero config) |
| **Validation** | express-validator 7                          |
| **Security** | helmet, cors, express-rate-limit               |
| **Testing**  | Jest, Supertest                                |

---

## 🏗 Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    React Frontend (Vite)                  │
│  ┌──────────┬─────────────┬───────────┬────────────────┐ │
│  │Dashboard │Transactions │ Analytics │  Categories    │ │
│  └──────────┴─────────────┴───────────┴────────────────┘ │
│                    │  Axios HTTP  │                       │
└────────────────────┼──────────────┼───────────────────────┘
                     │  /api/*      │
┌────────────────────┼──────────────┼───────────────────────┐
│              Express.js Backend (Port 5000)               │
│  ┌────────────────────────────────────────────────────┐   │
│  │ Middleware: Helmet, CORS, Rate Limit, Sanitisation │   │
│  └────────────────────────────────────────────────────┘   │
│  ┌──────────┬───────────┬────────────┬────────────────┐   │
│  │  Routes  │Validators │Controllers │   Services     │   │
│  └──────────┴───────────┴────────────┴────────────────┘   │
│  ┌────────────────────────────────────────────────────┐   │
│  │  Mongoose Models + MongoDB Aggregation Pipelines   │   │
│  └────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────┘
                          │
                ┌─────────┴─────────┐
                │  MongoDB Database  │
                │ (or Memory Server) │
                └───────────────────┘
```

**Design Pattern**: MVC + Service Layer  
- **Routes** → define endpoints and attach validators  
- **Validators** → express-validator chains for input sanitisation  
- **Controllers** → thin request/response handlers  
- **Services** → business logic, database queries, aggregation pipelines  
- **Models** → Mongoose schemas with indexes  

---

## 📁 Folder Structure

```
SpendWise/
├── client/                          # React Frontend
│   ├── index.html                   # HTML entry with SEO meta tags
│   ├── vite.config.js               # Vite config with API proxy
│   ├── package.json
│   └── src/
│       ├── main.jsx                 # React entry point
│       ├── App.jsx                  # Router configuration
│       ├── index.css                # Global design system (CSS variables)
│       ├── services/
│       │   └── api.js               # Axios instance with interceptors
│       ├── pages/
│       │   ├── Dashboard.jsx        # Overview + recent transactions
│       │   ├── Transactions.jsx     # CRUD + filters + pagination
│       │   ├── Analytics.jsx        # Charts overview page
│       │   └── Categories.jsx       # Income/Expense category management
│       └── components/
│           ├── layout/
│           │   ├── DashboardLayout.jsx
│           │   ├── Sidebar.jsx
│           │   └── Navbar.jsx
│           ├── charts/
│           │   ├── ChartUtils.jsx           # Shared tooltip, wrappers, selectors
│           │   ├── IncomeVsExpenseChart.jsx  # Grouped bar chart
│           │   ├── CategoryExpenseChart.jsx  # Donut/pie chart
│           │   ├── MonthlyTrendChart.jsx     # Area chart (yearly data)
│           │   └── YearlyTrendChart.jsx      # Net balance bars + stats
│           ├── transactions/
│           │   └── TransactionForm.jsx       # Create/Edit modal
│           └── categories/
│               └── CategoryForm.jsx          # Create/Edit modal
│
├── server/                          # Express Backend
│   ├── package.json
│   ├── .env                         # Environment configuration
│   ├── scripts/
│   │   ├── seed.js                  # Standalone seed script
│   │   └── seedFn.js                # Seed function (used on startup)
│   └── src/
│       ├── server.js                # Entry point, DB connect, startup seed
│       ├── app.js                   # Express app setup, middleware, routes
│       ├── config/
│       │   └── database.js          # Mongoose connection (+ memory fallback)
│       ├── models/
│       │   ├── Category.js          # Category schema + unique compound index
│       │   └── Transaction.js       # Transaction schema + optimised indexes
│       ├── routes/
│       │   ├── healthRoutes.js      # GET /api/health
│       │   ├── categoryRoutes.js    # CRUD /api/categories
│       │   ├── transactionRoutes.js # CRUD /api/transactions
│       │   └── analyticsRoutes.js   # GET /api/analytics/*
│       ├── controllers/
│       │   ├── healthController.js
│       │   ├── categoryController.js
│       │   ├── transactionController.js
│       │   └── analyticsController.js
│       ├── services/
│       │   ├── categoryService.js
│       │   ├── transactionService.js
│       │   └── analyticsService.js  # MongoDB aggregation pipelines
│       ├── validators/
│       │   ├── categoryValidator.js
│       │   ├── transactionValidator.js
│       │   └── analyticsValidator.js
│       ├── middleware/
│       │   ├── errorMiddleware.js   # Global error handler
│       │   └── validationMiddleware.js
│       └── utils/
│           ├── apiResponse.js       # Standardised JSON responses
│           ├── asyncHandler.js
│           └── queryHelpers.js      # Safe query builder + sort options
│
└── docs/                            # Documentation
    ├── PROJECT_STRUCTURE.md
    ├── architecture.md
    ├── api.md
    ├── database.md
    └── analytics.md
```

---

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** v18+ and **npm** v9+
- **MongoDB** (optional — the app auto-uses an in-memory MongoDB when `USE_MEMORY_DB=true`)

### Quick Start

```bash
# 1. Clone the repository
git clone <repository-url>
cd SpendWise

# 2. Install server dependencies
cd server
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env if needed (defaults work out of the box)

# 4. Start the backend (auto-seeds data on startup)
npm run dev

# 5. In a new terminal, install and start the client
cd ../client
npm install
npm run dev

# 6. Open browser
# → http://localhost:5173
```

The server starts on port **5000** and the Vite dev server on port **5173** with automatic API proxying.

---

## 🔐 Environment Variables

### Server (`server/.env`)

| Variable       | Default                                | Description                          |
|:---------------|:---------------------------------------|:-------------------------------------|
| `PORT`         | `5000`                                 | Server port                          |
| `NODE_ENV`     | `development`                          | Environment mode                     |
| `MONGODB_URI`  | `mongodb://127.0.0.1:27017/spendwise`  | MongoDB connection string            |
| `CLIENT_URL`   | `http://localhost:5173`                | CORS allowed origin                  |
| `USE_MEMORY_DB`| `true`                                 | Use in-memory MongoDB (no install)   |

### Client (`client/.env`)

| Variable    | Default                  | Description     |
|:------------|:-------------------------|:----------------|
| `VITE_API`  | `/api` (via proxy)       | API base URL    |

---

## 🌱 Seed Data

When `USE_MEMORY_DB=true`, the server automatically seeds the database on every startup with:

- **14 categories** (5 income + 9 expense) with icons and colours
- **47 transactions** spread across the past 6 months with realistic amounts and descriptions

To manually seed with a real MongoDB:

```bash
cd server
npm run seed
```

---

## 📡 API Endpoints

### Health
| Method | Endpoint           | Description          |
|:-------|:-------------------|:---------------------|
| GET    | `/api/health`      | Server health check  |

### Categories
| Method | Endpoint               | Description                     |
|:-------|:-----------------------|:--------------------------------|
| GET    | `/api/categories`      | List all (filter by `?type=`)   |
| GET    | `/api/categories/:id`  | Get single category             |
| POST   | `/api/categories`      | Create new category             |
| PUT    | `/api/categories/:id`  | Update category                 |
| DELETE | `/api/categories/:id`  | Delete (safe — checks refs)     |

### Transactions
| Method | Endpoint                 | Description                              |
|:-------|:-------------------------|:-----------------------------------------|
| GET    | `/api/transactions`      | List with filters, search, sort, paginate|
| GET    | `/api/transactions/:id`  | Get single transaction                   |
| POST   | `/api/transactions`      | Create new transaction                   |
| PUT    | `/api/transactions/:id`  | Update transaction                       |
| DELETE | `/api/transactions/:id`  | Delete transaction                       |

### Analytics (MongoDB Aggregation)
| Method | Endpoint                          | Description                        |
|:-------|:----------------------------------|:-----------------------------------|
| GET    | `/api/analytics/dashboard`        | Overall totals + current month     |
| GET    | `/api/analytics/monthly`          | Monthly stats (`?year=&month=`)    |
| GET    | `/api/analytics/yearly`           | Full year breakdown (`?year=`)     |
| GET    | `/api/analytics/category-expenses`| Expense by category (`?startDate=&endDate=`) |
| GET    | `/api/analytics/income-vs-expense`| Monthly income vs expense series   |

For complete API documentation with request/response examples, see [docs/api.md](docs/api.md).

---

## 🗄 Database Schema

### Category
| Field       | Type     | Required | Notes                           |
|:------------|:---------|:---------|:--------------------------------|
| name        | String   | Yes      | Max 50 chars, unique per type   |
| type        | String   | Yes      | `income` or `expense`           |
| description | String   | No       | Max 200 chars                   |
| icon        | String   | No       | Icon key (maps to emoji)        |
| color       | String   | No       | Hex colour code                 |
| isActive    | Boolean  | No       | Soft delete support             |

**Index**: `{ name: 1, type: 1 }` (unique compound)

### Transaction
| Field         | Type     | Required | Notes                               |
|:------------- |:---------|:---------|:------------------------------------|
| type          | String   | Yes      | `income` or `expense`               |
| amount        | Number   | Yes      | Must be > 0                         |
| category      | ObjectId | Yes      | Ref → Category                      |
| description   | String   | Yes      | 2-250 chars                         |
| date          | Date     | Yes      | Defaults to now                     |
| paymentMethod | String   | Yes      | Cash, Card, UPI, Bank Transfer, Other |
| notes         | String   | No       | Max 500 chars                       |

**Indexes**: `{ type: 1 }`, `{ category: 1 }`, `{ date: -1 }`, `{ type: 1, date: -1 }`, `{ category: 1, date: -1 }`

For complete schema documentation, see [docs/database.md](docs/database.md).

---

## 🔒 Security Measures

| Measure                    | Implementation                                          |
|:---------------------------|:--------------------------------------------------------|
| HTTP Security Headers      | `helmet` middleware                                     |
| CORS                       | Configured with whitelisted `CLIENT_URL`                |
| Rate Limiting              | 300 requests per 15 minutes per IP                      |
| Input Validation           | `express-validator` on all routes                       |
| Query Sanitisation         | Custom middleware strips `$` and `.` operators           |
| ObjectId Validation        | `isMongoId()` on all `:id` params                       |
| Date Validation            | `isISO8601()` on all date inputs                        |
| Numeric Validation         | `isFloat()` / `isInt()` with min/max bounds             |
| Regex Escaping             | Search queries are escaped before `$regex`               |
| Error Handling             | Centralized handler; no stack traces in production       |
| Category-Transaction Match | Server enforces category type must match transaction type|
| Safe Deletion              | Categories with transactions cannot be deleted           |

---

## 🚀 Future Enhancements

- 🔐 User authentication (JWT/OAuth)
- 📊 Budget tracking and alerts
- 📱 Mobile-responsive PWA
- 📤 Export to CSV/PDF
- 🔄 Recurring transactions
- 🏷️ Multi-currency support
- 📈 Year-over-year comparison analytics
- 🌐 Multi-language (i18n) support

---

## 📄 License

This project is created as an internship submission and is available under the ISC License.

---

**Built with ❤️ using the MERN Stack**
