# 📡 SpendWise API Documentation

This document outlines the complete REST API specification for **SpendWise — Personal Expense Tracker & Financial Analytics**.

---

## Base URL & General Conventions

- **Base URL**: `http://localhost:5000/api`
- **Root Endpoint**: `GET /api` returns `{ "success": true, "message": "SpendWise API is running", "version": "1.0.0" }`
- **Content-Type**: `application/json`
- **Authentication**: Protected routes require `Authorization: Bearer <JWT_TOKEN>` header.
- **Response Format**: Standardized JSON envelopes.

---

## Summary of Endpoints

| Resource | Method | Endpoint | Access | Description |
|---|---|---|---|---|
| **Root** | `GET` | `/api` | Public | API root status & version |
| **Health** | `GET` | `/api/health` | Public | Server & DB health check status |
| **Auth** | `POST` | `/api/auth/register` | Public | Register new user + auto-provision default categories |
| **Auth** | `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |
| **Auth** | `GET` | `/api/auth/me` | Protected | Get current user profile |
| **Auth** | `POST` | `/api/auth/logout` | Protected | Terminate user session |
| **Categories** | `GET` | `/api/categories` | Protected | Fetch user categories (filterable by `type`) |
| **Categories** | `GET` | `/api/categories/:id` | Protected | Fetch single category |
| **Categories** | `POST` | `/api/categories` | Protected | Create user category |
| **Categories** | `PUT` | `/api/categories/:id` | Protected | Update user category |
| **Categories** | `DELETE` | `/api/categories/:id` | Protected | Delete user category (with safe transaction check) |
| **Transactions**| `GET` | `/api/transactions` | Protected | List transactions with search, filters & pagination |
| **Transactions**| `GET` | `/api/transactions/:id` | Protected | Fetch single transaction |
| **Transactions**| `POST` | `/api/transactions` | Protected | Create new transaction |
| **Transactions**| `PUT` | `/api/transactions/:id` | Protected | Update transaction |
| **Transactions**| `DELETE` | `/api/transactions/:id` | Protected | Delete transaction |
| **Budgets** | `GET` | `/api/budgets` | Protected | Get monthly budgets with real-time spend calculations |
| **Budgets** | `POST` | `/api/budgets` | Protected | Create monthly category budget |
| **Budgets** | `PUT` | `/api/budgets/:id` | Protected | Update budget amount |
| **Budgets** | `DELETE` | `/api/budgets/:id` | Protected | Delete budget |
| **Analytics** | `GET` | `/api/analytics/dashboard` | Protected | Summary metrics, recent transactions & category ranks |
| **Analytics** | `GET` | `/api/analytics/monthly` | Protected | Daily aggregated cashflow breakdown for a month |
| **Analytics** | `GET` | `/api/analytics/yearly` | Protected | 12-month aggregated trends for a year |
| **Analytics** | `GET` | `/api/analytics/category-expenses`| Protected | Category expenses grouped by distribution |
| **Analytics** | `GET` | `/api/analytics/income-vs-expense` | Protected | Date-range cashflow comparison |

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
Registers a new user, creates their initial 15 standard categories (10 expense, 5 income), and issues a JWT token.

- **Request Body**:
```json
{
  "name": "Alex Morgan",
  "email": "alex@example.com",
  "password": "Password123!"
}
```
- **Response**: `201 Created`

### `POST /api/auth/login`
Authenticates a user by email and password.

- **Request Body**:
```json
{
  "email": "alex@example.com",
  "password": "Password123!"
}
```
- **Response**: `200 OK`

### `GET /api/auth/me`
Retrieves authenticated user profile. Requires Bearer Token.

- **Response**: `200 OK`

---

## 2. Budget Endpoints

### `GET /api/budgets`
Retrieves monthly budgets for the authenticated user, automatically aggregating spent amount from user's expense transactions.

- **Query Parameters**:
  - `month` (optional, 1-12, default: current month)
  - `year` (optional, 2000-2100, default: current year)
- **Response**: `200 OK`
```json
{
  "success": true,
  "message": "Budgets retrieved successfully",
  "data": {
    "month": 10,
    "year": 2026,
    "totalBudget": 25000,
    "totalSpent": 14200,
    "remainingBudget": 10800,
    "overallProgress": 56.8,
    "budgets": [
      {
        "_id": "660c1e8a...",
        "category": {
          "_id": "...",
          "name": "Food & Dining",
          "color": "#EF4444"
        },
        "amount": 10000,
        "spent": 4500,
        "remaining": 5500,
        "progress": 45.0,
        "month": 10,
        "year": 2026
      }
    ]
  }
}
```

### `POST /api/budgets`
Creates a monthly budget for an expense category.

- **Request Body**:
```json
{
  "category": "660c1e8a9f1b2c001a8d0001",
  "amount": 10000,
  "month": 10,
  "year": 2026
}
```
- **Response**: `201 Created`

---

## 3. Data Isolation Policy

SpendWise strictly enforces user data isolation:
- All database queries filter by `req.user._id`.
- Transactions, Categories, and Budgets have foreign keys to the owning User.
- Attempting to access or mutate resources belonging to another user results in `404 Not Found` or `400 Bad Request`.
