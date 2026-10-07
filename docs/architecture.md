# 🏗 SpendWise Architecture Documentation

## System Architecture

SpendWise follows a **client-server architecture** with a clear separation between the React frontend and Express.js backend, communicating via RESTful APIs.

---

## High-Level Architecture

```
┌──────────────────────────────────────────────────┐
│               Client (React + Vite)              │
│                Port 5173                         │
│  ┌────────────┐ ┌──────────────┐ ┌───────────┐  │
│  │ Pages      │ │  Components  │ │ Services  │  │
│  │ Dashboard  │ │  Charts      │ │ api.js    │  │
│  │ Transactions│ │  Layout     │ │ (Axios)   │  │
│  │ Analytics  │ │  Forms       │ │           │  │
│  │ Categories │ │              │ │           │  │
│  └────────────┘ └──────────────┘ └───────────┘  │
│                     │                            │
│              Vite Proxy (/api → :5000)           │
└─────────────────────┼────────────────────────────┘
                      │ HTTP (JSON)
┌─────────────────────┼────────────────────────────┐
│               Server (Express.js)                │
│                Port 5000                         │
│  ┌─────────────────────────────────────────────┐ │
│  │    Middleware Layer                          │ │
│  │  Helmet → CORS → Rate Limit → Sanitisation  │ │
│  │  → Body Parser → Routing                    │ │
│  └─────────────────────────────────────────────┘ │
│  ┌──────────┐ ┌────────────┐ ┌───────────────┐  │
│  │  Routes  │→│ Validators │→│  Controllers  │  │
│  └──────────┘ └────────────┘ └───────┬───────┘  │
│                                      │           │
│                              ┌───────┴───────┐   │
│                              │   Services    │   │
│                              │ (Business     │   │
│                              │  Logic +      │   │
│                              │  Aggregation) │   │
│                              └───────┬───────┘   │
│                              ┌───────┴───────┐   │
│                              │   Models      │   │
│                              │ (Mongoose)    │   │
│                              └───────────────┘   │
└──────────────────────┬───────────────────────────┘
                       │
              ┌────────┴────────┐
              │    MongoDB      │
              │ (or In-Memory)  │
              └─────────────────┘
```

---

## Design Patterns

### MVC + Service Layer Pattern

The backend follows a layered architecture:

| Layer          | Responsibility                                  | Files                     |
|:---------------|:------------------------------------------------|:--------------------------|
| **Routes**     | URL mapping, attach middleware & validators      | `routes/*.js`             |
| **Validators** | Input validation using express-validator chains  | `validators/*.js`         |
| **Controllers**| Parse request, call service, send response       | `controllers/*.js`        |
| **Services**   | Business logic, DB queries, aggregation pipelines| `services/*.js`           |
| **Models**     | Mongoose schemas, indexes, constraints           | `models/*.js`             |
| **Middleware** | Cross-cutting concerns (auth, errors, etc.)      | `middleware/*.js`         |
| **Utils**      | Shared helpers (response format, query builders) | `utils/*.js`              |

### Why Service Layer?

- Controllers stay thin (only request/response handling)
- Services encapsulate business rules and database operations
- Services can be unit-tested independently of Express
- Aggregation pipeline logic is co-located with related business logic

---

## Frontend Architecture

### Component Hierarchy

```
App (BrowserRouter)
├── Dashboard Page
│   └── DashboardLayout
│       ├── Sidebar (navigation)
│       ├── Navbar (top bar)
│       └── Content (summary cards + recent transactions)
│
├── Transactions Page
│   └── DashboardLayout
│       └── Content (filter bar + table + pagination)
│           └── TransactionForm (modal)
│
├── Analytics Page
│   └── DashboardLayout
│       └── Content
│           ├── Overview stat cards
│           ├── IncomeVsExpenseChart
│           ├── CategoryExpenseChart
│           ├── MonthlyTrendChart
│           └── YearlyTrendChart
│
└── Categories Page
    └── DashboardLayout
        └── Content
            ├── CategorySection (Income)
            ├── CategorySection (Expense)
            ├── CategoryForm (modal)
            └── DeleteConfirmModal
```

### Data Flow

1. **Page mounts** → calls `api.get()` using Axios instance
2. **API service** → proxied through Vite to `http://localhost:5000`
3. **Response** → `res.data.data` extracted and set to React state
4. **Charts** → each chart component manages its own API call, loading, and error state
5. **Forms** → submit via `api.post()` / `api.put()`, call `onSuccess()` callback to refresh parent data

---

## Request Lifecycle

```
Client Request
    │
    ▼
[Helmet]         ← Security headers
    │
    ▼
[CORS]           ← Origin validation
    │
    ▼
[Rate Limiter]   ← 300 req/15min
    │
    ▼
[Body Parser]    ← JSON parsing
    │
    ▼
[Sanitiser]      ← Strip $ and . operators
    │
    ▼
[Router]         ← Match route
    │
    ▼
[Validator]      ← express-validator checks
    │
    ▼
[Controller]     ← Parse request
    │
    ▼
[Service]        ← Business logic + DB
    │
    ▼
[Response]       ← Standardised JSON
    │
    ▼
[Error Handler]  ← Catches thrown errors
```

---

## Database Design

### MongoDB Collections

- **categories** — Income and expense category definitions
- **transactions** — Financial records linking to categories

### Indexing Strategy

Indexes are designed to optimise the most common query patterns:

```javascript
// Transaction indexes
{ type: 1 }               // Filter by income/expense
{ category: 1 }           // Filter by category
{ date: -1 }              // Sort by date (newest first)
{ type: 1, date: -1 }     // Compound: type filter + date sort
{ category: 1, date: -1 } // Compound: category filter + date sort

// Category indexes
{ name: 1, type: 1 }      // Unique compound: prevent duplicate names per type
```

---

## API Response Format

All API responses follow a consistent structure:

### Success Response
```json
{
  "success": true,
  "message": "Description of the action",
  "data": { /* payload */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Description of the error",
  "errors": [
    { "field": "fieldName", "message": "Specific error" }
  ]
}
```

---

## Development Environment

### In-Memory MongoDB

When `USE_MEMORY_DB=true`, the app uses `mongodb-memory-server` which:
- Downloads and runs a local MongoDB binary automatically
- Seeds 14 categories and 47 transactions on every startup
- Requires zero MongoDB installation
- Data is ephemeral (reset on server restart)

### Vite Proxy

The Vite dev server proxies `/api/*` requests to `http://localhost:5000`, avoiding CORS issues in development:

```javascript
// vite.config.js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true
    }
  }
}
```
