# 🗄 SpendWise Database Design & Schema Documentation

SpendWise uses **MongoDB** as its primary NoSQL document store, orchestrated via **Mongoose ODM**. The schema design prioritizes high query performance, referential integrity, and rapid aggregation operations.

---

## 1. Entity-Relationship Overview

SpendWise data model consists of two core collections: `categories` and `transactions`.

```
┌───────────────────────────────────────┐
│              categories               │
├───────────────────────────────────────┤
│ _id: ObjectId (PK)                    │
│ name: String                          │
│ type: Enum ("income", "expense")      │
│ description: String                   │
│ icon: String                          │
│ color: String                         │
│ isActive: Boolean                     │
│ createdAt: ISODate                    │
│ updatedAt: ISODate                    │
└──────────────────┬────────────────────┘
                   │
                   │ 1:N Relationship
                   │ (Referenced by ObjectId)
                   ▼
┌───────────────────────────────────────┐
│             transactions              │
├───────────────────────────────────────┤
│ _id: ObjectId (PK)                    │
│ type: Enum ("income", "expense")      │
│ amount: Number                        │
│ category: ObjectId (FK -> Category)   │
│ description: String                   │
│ date: ISODate                         │
│ paymentMethod: Enum                   │
│ notes: String                         │
│ createdAt: ISODate                    │
│ updatedAt: ISODate                    │
└───────────────────────────────────────┘
```

---

## 2. Collection Schemas

### Category Schema (`Category.js`)

| Field | Type | Required | Default | Constraints & Description |
|---|---|---|---|---|
| `_id` | `ObjectId` | Auto | Generated | Unique identifier |
| `name` | `String` | Yes | — | Trimmed, max 50 characters |
| `type` | `String` | Yes | — | Enum: `['income', 'expense']` |
| `description` | `String` | No | `""` | Trimmed, max 200 characters |
| `icon` | `String` | No | `"tag"` | FontAwesome / Lucide icon identifier |
| `color` | `String` | No | `"#64748B"` | Hexadecimal color code |
| `isActive` | `Boolean` | No | `true` | Soft-state flag for active categories |
| `createdAt` | `Date` | Auto | `Date.now` | Managed by Mongoose timestamps |
| `updatedAt` | `Date` | Auto | `Date.now` | Managed by Mongoose timestamps |

#### Unique Compound Index
```javascript
categorySchema.index({ name: 1, type: 1 }, { unique: true });
```
*Prevents creating duplicate category names under the same financial type (e.g. allows a "Bonus" expense and "Bonus" income, but prevents two "Food & Dining" expense categories).*

---

### Transaction Schema (`Transaction.js`)

| Field | Type | Required | Default | Constraints & Description |
|---|---|---|---|---|
| `_id` | `ObjectId` | Auto | Generated | Unique identifier |
| `type` | `String` | Yes | — | Enum: `['income', 'expense']` |
| `amount` | `Number` | Yes | — | Min: `0.01`, 2 decimal currency value |
| `category` | `ObjectId` | Yes | — | References `Category._id` |
| `description` | `String` | Yes | — | Trimmed, max 250 characters |
| `date` | `Date` | Yes | `Date.now` | Transaction occurrence timestamp |
| `paymentMethod` | `String` | Yes | `'Cash'` | Enum: `['Cash', 'Card', 'UPI', 'Bank Transfer', 'Other']` |
| `notes` | `String` | No | `""` | Trimmed, max 500 characters |
| `createdAt` | `Date` | Auto | `Date.now` | Managed by Mongoose timestamps |
| `updatedAt` | `Date` | Auto | `Date.now` | Managed by Mongoose timestamps |

---

## 3. Database Indexing Strategy

Indexing is critical for fast filtering, pagination, and real-time MongoDB aggregation pipelines over growing transaction volumes.

```javascript
// Single-Field Indexes
transactionSchema.index({ type: 1 });        // Filter by income/expense
transactionSchema.index({ category: 1 });    // Lookup by category & joins
transactionSchema.index({ date: -1 });       // Chronological sorting
transactionSchema.index({ createdAt: -1 });  // Insertion sorting

// Compound Indexes for High-Frequency Queries
transactionSchema.index({ type: 1, date: -1 });     // Date range filters for specific type
transactionSchema.index({ category: 1, date: -1 }); // Category history over time
```

### Performance Benefits:
- **`{ date: -1 }` index**: Powers instant chronological ordering for transaction tables without in-memory sorting.
- **`{ type: 1, date: -1 }` compound index**: Eliminates full-collection scans in `$match` stages of yearly/monthly aggregation pipelines.
- **`{ category: 1 }` index**: Optimizes foreign key checks before category deletion and facilitates fast `$lookup` aggregation stages.

---

## 4. Referential Integrity & Deletion Safety

MongoDB does not enforce foreign key cascade constraints by default. SpendWise enforces referential integrity at the application service layer:

1. **Transaction Validation**: When creating or updating a transaction, the controller verifies that the specified `category` ID exists in the database and that its `type` matches the transaction type (`income` or `expense`).
2. **Category Deletion Protection**: Before deleting a category, the controller performs a count query:
   ```javascript
   const transactionCount = await Transaction.countDocuments({ category: req.params.id });
   if (transactionCount > 0) {
     return errorResponse(
       res,
       `Cannot delete category '${category.name}'. It is currently associated with ${transactionCount} transaction(s). Please reassign or delete these transactions first.`,
       [],
       400
     );
   }
   ```

---

## 5. Seed Data Architecture

SpendWise includes an automated seed script (`server/src/utils/seedData.js`) that provisions:
- **10 Core Expense Categories**: Housing, Food & Dining, Transportation, Utilities, Healthcare, Entertainment, Shopping, Personal Care, Education, Travel.
- **5 Core Income Categories**: Salary, Freelance, Investments, Side Business, Gifts & Grants.
- **50+ Realistically Distributed Transactions**: Spanning multiple months, payment methods, and realistic monetary amounts.

To run the seed script:
```bash
npm run seed
```
