# 📊 SpendWise Analytics & Aggregation Engine

SpendWise shifts heavy financial computations from the client browser to **MongoDB Aggregation Pipelines**. This ensures sub-millisecond calculation speeds, scalability for thousands of transactions, and consistent financial metrics across devices.

---

## 1. Architectural Philosophy

### ❌ What We Avoid (Client-Side Computation)
- Fetching 10,000 raw transaction records into React state.
- Looping, filtering, and reducing arrays on every render or device resize.
- Inaccurate floating-point sums and heavy memory consumption on mobile clients.

### ✅ What We Implement (Server-Side MongoDB Aggregations)
- Offload filtering, grouping, sorting, and arithmetic to MongoDB engine.
- Return compact, pre-calculated, chart-ready JSON datasets.
- Client React app only binds the aggregate output directly into Recharts components.

---

## 2. Aggregation Pipelines Breakdown

### A. Dashboard Overview Pipeline (`getDashboardAnalytics`)

Calculates total income, total expense, net balance, savings rate, and category rankings in parallel.

#### Pipeline Structure:
```javascript
// Step 1: Group totals by transaction type
[
  {
    $group: {
      _id: '$type',
      totalAmount: { $sum: '$amount' },
      count: { $sum: 1 }
    }
  }
]
```

#### Category Spend Aggregation Pipeline:
```javascript
[
  { $match: { type: 'expense' } },
  {
    $group: {
      _id: '$category',
      totalAmount: { $sum: '$amount' },
      transactionCount: { $sum: 1 }
    }
  },
  { $sort: { totalAmount: -1 } },
  { $limit: 5 },
  {
    $lookup: {
      from: 'categories',
      localField: '_id',
      foreignField: '_id',
      as: 'categoryDetails'
    }
  },
  { $unwind: '$categoryDetails' },
  {
    $project: {
      _id: 0,
      categoryId: '$_id',
      categoryName: '$categoryDetails.name',
      icon: '$categoryDetails.icon',
      color: '$categoryDetails.color',
      totalAmount: { $round: ['$totalAmount', 2] },
      transactionCount: 1
    }
  }
]
```

---

### B. Monthly Daily Breakdown Pipeline (`getMonthlyAnalytics`)

Groups transactions by day of the month for selected year and month, pivoting income and expense.

```javascript
[
  {
    $match: {
      date: { $gte: startOfMonth, $lte: endOfMonth }
    }
  },
  {
    $group: {
      _id: { $dayOfMonth: '$date' },
      income: {
        $sum: {
          $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0]
        }
      },
      expense: {
        $sum: {
          $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0]
        }
      }
    }
  },
  { $sort: { '_id': 1 } },
  {
    $project: {
      _id: 0,
      day: '$_id',
      income: { $round: ['$income', 2] },
      expense: { $round: ['$expense', 2] },
      net: { $round: [{ $subtract: ['$income', '$expense'] }, 2] }
    }
  }
]
```

---

### C. Yearly 12-Month Trend Pipeline (`getYearlyAnalytics`)

Groups transactions by calendar month (`1` to `12`) for any selected year.

```javascript
[
  {
    $match: {
      date: { $gte: startOfYear, $lte: endOfYear }
    }
  },
  {
    $group: {
      _id: { $month: '$date' },
      income: {
        $sum: {
          $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0]
        }
      },
      expense: {
        $sum: {
          $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0]
        }
      }
    }
  },
  { $sort: { '_id': 1 } }
]
```

*The backend fills any missing months with zeroes so the chart always displays a seamless 12-month continuum (`Jan` through `Dec`).*

---

### D. Category Expenses Distribution (`getCategoryExpenses`)

Categorizes expenses with dynamic percentage computation across optional date ranges.

```javascript
[
  {
    $match: {
      type: 'expense',
      ...(dateFilter)
    }
  },
  {
    $group: {
      _id: '$category',
      totalAmount: { $sum: '$amount' },
      transactionCount: { $sum: 1 }
    }
  },
  { $sort: { totalAmount: -1 } },
  {
    $lookup: {
      from: 'categories',
      localField: '_id',
      foreignField: '_id',
      as: 'category'
    }
  },
  { $unwind: '$category' }
]
```

---

## 3. Recharts Visualization Suite

SpendWise pairs MongoDB aggregations with custom-styled Recharts components:

| Chart Component | Chart Type | Data Source Endpoint | Visual Purpose |
|---|---|---|---|
| `IncomeVsExpenseChart` | Donut / Pie (`PieChart`, `Cell`) | `/api/analytics/income-vs-expense` | High-level cashflow ratio & savings rate gauge |
| `CategoryExpenseChart` | Interactive Donut / Pie | `/api/analytics/category-expenses` | Budget allocation breakdown per category |
| `MonthlyTrendChart` | Dual Area Chart (`AreaChart`) | `/api/analytics/monthly` | Daily spending trajectory & cashflow volatility |
| `YearlyTrendChart` | Grouped Bar Chart (`BarChart`) | `/api/analytics/yearly` | 12-month seasonal income vs expense patterns |

### UX Polish & Error States
All charts feature:
- **Loading Skeleton / Spinner**: Smooth pulse animations during network fetches.
- **Empty State**: Elegant custom fallback UI with call-to-action when no data is recorded.
- **Error State**: Inline retry action and user-friendly error banners.
- **Custom Tooltips**: Formatted currencies, percentages, and custom styled glassmorphic containers.
- **Year/Month Selectors**: Dropdown filters allowing historical data exploration.
