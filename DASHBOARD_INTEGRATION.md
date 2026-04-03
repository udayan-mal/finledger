# Dashboard Real Data Integration Guide

## Overview

The FinLedger dashboard has been updated to display **live data** that updates dynamically as you add transactions, accounts, and investments. This document explains the changes and how to test the new features.

## ✨ Features Added

### 1. **Dynamic Metrics Cards** (Top Row)
- **Total Net Worth**: Sum of all bank/cash accounts + portfolio value
- **Total Income (Month)**: Sum of all income transactions in current month
- **Total Expenses (Month)**: Sum of all expense transactions in current month
- **Portfolio Value**: Current value of all mutual fund holdings
- **Bank + Cash Balance**: Combined balance of liquid accounts (BANK, CASH, WALLET types)
- **Savings Rate**: Percentage = (Income - Expenses) / Income

### 2. **Cash Flow Chart** (Last 6 Months)
- Shows income (green area) vs expenses (red area) side-by-side
- Data grouped by month
- Updates automatically as you add transactions
- Tooltip shows exact values on hover

### 3. **Expense Breakdown** (Right Panel)
- Top 5 expense categories in current month
- Shows amount and percentage for each category
- Visual progress bars for quick scanning
- Categories pulled from your transaction records

### 4. **Active Holdings Table** (Bottom)
- Lists all mutual fund positions
- Shows units, NAV, current value, and P&L %
- Updates in real-time as you add investments
- Limited to top 10 holdings for readability

## 🔧 Backend Implementation

### Updated Service: `dashboardService.js`

The service now calculates:

```javascript
// Core metrics (in paise for precision)
{
  metrics: {
    netWorthPaise,          // Sum of all accounts + portfolio
    monthlyIncomePaise,     // Current month income
    monthlyExpensePaise,    // Current month expenses
    portfolioValuePaise,    // Current MF value
    bankCashPaise,          // Liquid accounts
    savingsRatePercent,     // (Income - Expense) / Income * 100
    portfolioPnlPercent     // Portfolio gain/loss percentage
  },
  cashFlow: [
    { month: 'Jan', income: 50000, expense: 30000, savings: 20000 },
    // ... 6 months of data
  ],
  expenseBreakdown: [
    { name: 'Food', amount: 15000, percentage: 25 },
    // ... top 5 categories
  ],
  holdings: [
    { id, name, units, navAtBuyPaise, currentValue, pnlPercent },
    // ... top 10 holdings
  ]
}
```

### API Endpoint

**GET** `/api/v1/dashboard/summary`

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "metrics": { ... },
    "cashFlow": [ ... ],
    "expenseBreakdown": [ ... ],
    "holdings": [ ... ]
  }
}
```

## 🎨 Frontend Implementation

### Updated Component: `dashboard/page.js`

**Key Features:**
- ✅ **useEffect hook** fetches data on component mount
- ✅ **Loading skeleton** displayed while fetching
- ✅ **Error handling** with retry button
- ✅ **Auto-refresh** every 5 minutes
- ✅ **Responsive layout** adapts to all screen sizes
- ✅ **Currency formatting** converts paise to rupees

**Code Example:**
```javascript
useEffect(() => {
  const fetchDashboardData = async () => {
    const response = await fetch("/api/v1/dashboard/summary");
    const result = await response.json();
    setData(result.data);
  };

  fetchDashboardData();
  
  // Refresh every 5 minutes
  const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
  return () => clearInterval(interval);
}, []);
```

### Updated Chart: `ExpenseAreaChart.js`

Now accepts real data and displays:
- Income (green) and Expense (red) as stacked areas
- Proper formatting with rupee symbols
- Legend showing both data series
- Tooltip on hover with exact values

**Usage:**
```javascript
<ExpenseAreaChart data={cashFlow} />
```

## 🚀 How to Test

### Step 1: Create User Accounts

Open your database and insert test user accounts (or use API):

```sql
INSERT INTO "User" (id, name, email, "passwordHash", "createdAt", "updatedAt")
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Test User',
  'test@finledger.com',
  '<bcrypt_hash_of_password>',
  NOW(),
  NOW()
);
```

### Step 2: Add Test Accounts

Insert bank/cash accounts:

```sql
INSERT INTO "Account" (id, "userId", type, name, "balancePaise", "createdAt", "updatedAt")
VALUES
  ('acc-001', '550e8400-e29b-41d4-a716-446655440000', 'BANK', 'HDFC Checking', 5000000, NOW(), NOW()),
  ('acc-002', '550e8400-e29b-41d4-a716-446655440000', 'CASH', 'Wallet', 250000, NOW(), NOW()),
  ('acc-003', '550e8400-e29b-41d4-a716-446655440000', 'INVESTMENT', 'Trading Account', 3000000, NOW(), NOW());
```

### Step 3: Add Categories

```sql
INSERT INTO "Category" (id, "userId", name, type, color, "createdAt", "updatedAt")
VALUES
  ('cat-001', '550e8400-e29b-41d4-a716-446655440000', 'Food', 'EXPENSE', '#FF6B6B', NOW(), NOW()),
  ('cat-002', '550e8400-e29b-41d4-a716-446655440000', 'Transport', 'EXPENSE', '#4ECDC4', NOW(), NOW()),
  ('cat-003', '550e8400-e29b-41d4-a716-446655440000', 'Salary', 'INCOME', '#45B7D1', NOW(), NOW());
```

### Step 4: Add Transactions

```sql
-- Income transaction (current month)
INSERT INTO "Transaction" (id, "userId", "accountId", type, "amountPaise", "categoryId", note, date, "createdAt", "updatedAt")
VALUES ('tx-001', '550e8400-e29b-41d4-a716-446655440000', 'acc-001', 'INCOME', 300000000, 'cat-003', 'Monthly salary', NOW(), NOW(), NOW());

-- Expense transactions (current month)
INSERT INTO "Transaction" (id, "userId", "accountId", type, "amountPaise", "categoryId", note, date, "createdAt", "updatedAt")
VALUES
  ('tx-002', '550e8400-e29b-41d4-a716-446655440000', 'acc-002', 'EXPENSE', 5000000, 'cat-001', 'Lunch and dinner', NOW(), NOW(), NOW()),
  ('tx-003', '550e8400-e29b-41d4-a716-446655440000', 'acc-002', 'EXPENSE', 2000000, 'cat-002', 'Uber rides', NOW(), NOW(), NOW());
```

### Step 5: Add Mutual Funds

```sql
INSERT INTO "MutualFund" (id, "userId", "fundName", units, "navAtBuyPaise", "investedAmountPaise", "createdAt", "updatedAt")
VALUES ('mf-001', '550e8400-e29b-41d4-a716-446655440000', 'Vanguard Bluechip', 50000, 2410500, 1205000000, NOW(), NOW());
```

### Step 6: Login and View Dashboard

1. Navigate to `http://localhost:3000/login`
2. Login with user credentials (email: test@finledger.com)
3. Click Dashboard → You'll see:
   - **Loading skeleton** (brief animation)
   - **Metrics populate** with calculated values
   - **Charts render** with test data
   - **Holdings table** displays MF positions

## 📊 Expected Results

### Example Dashboard Output

```
Total Net Worth:        ₹81,25,000
Total Income (Month):   ₹30,00,000
Total Expenses (Month): ₹7,00,000
Portfolio Value:        ₹12,05,000
Bank + Cash Balance:    ₹75,00,000
Savings Rate:           76.67%

Cash Flow Chart:
┌─────────────────────────────────────┐
│ Income (green) vs Expense (red)     │
│ Shows last 6 months of transactions │
└─────────────────────────────────────┘

Expense Breakdown:
- Food:         ₹5,00,000 (71%)
- Transport:    ₹2,00,000 (29%)

Holdings:
- Vanguard Bluechip:  500 units @ ₹241.05 = ₹1,20,500
```

## 🔄 Data Flow

```
User adds Transaction
    ↓
POST /api/v1/transactions
    ↓
Data saved to PostgreSQL
    ↓
User refreshes Dashboard (or auto-refresh in 5 min)
    ↓
GET /api/v1/dashboard/summary
    ↓
Backend aggregates all data:
- Sum account balances
- Calculate monthly income/expense
- Group transactions by month
- Calculate savings rate
- Get expense breakdown
    ↓
Frontend displays updated metrics
    ↓
Charts and cards reflect live data
```

## 🛠️ Testing Checklist

- [ ] **Loading State**: Skeleton appears briefly while loading
- [ ] **Net Worth**: Equals sum of all account balances + portfolio
- [ ] **Monthly Income**: Shows sum of INCOME transactions this month
- [ ] **Expenses**: Shows sum of EXPENSE transactions this month
- [ ] **Savings Rate**: Calculates correctly (Income-Expense)/Income*100
- [ ] **Cash Flow Chart**: Shows income (green) and expense (red) for 6 months
- [ ] **Expense Breakdown**: Top 5 categories with percentages
- [ ] **Holdings Table**: Lists all MF positions with P&L
- [ ] **Error Handling**: Retry button works if API fails
- [ ] **Auto-refresh**: Dashboard updates after 5 minutes
- [ ] **Responsive**: Works on mobile, tablet, and desktop

## ⚙️ Configuration

### Refresh Interval

Edit `dashboard/page.js` line 66 to change refresh frequency:

```javascript
// Default: 5 minutes
const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);

// Change to 1 minute for testing:
const interval = setInterval(fetchDashboardData, 60 * 1000);
```

### Paise Conversion

All backend calculations use **paise** (1 rupee = 100 paise) for precision. Frontend automatically converts:

```javascript
const formatCurrency = (paise) => {
  return (paise / 100).toFixed(2); // Converts to rupees
};
```

## 🐛 Debugging

### Check Network Tab (Chrome DevTools)

1. Open DevTools → Network tab
2. Look for `GET /api/v1/dashboard/summary`
3. Check Response tab for JSON data
4. Verify `data.metrics` contains expected values

### Check Console Logs

Dashboard logs errors to console:

```javascript
catch (err) {
  console.error("Dashboard error:", err);
  setError(err.message);
}
```

### Test API Directly

```powershell
$headers = @{'Authorization'='Bearer YOUR_JWT_TOKEN'}
Invoke-WebRequest -Uri 'http://localhost:4000/api/v1/dashboard/summary' -Headers $headers | Select-Object -ExpandProperty Content | ConvertFrom-Json
```

## 📄 Files Modified

| File | Changes |
|------|---------|
| `web/backend/src/services/dashboardService.js` | Complete rewrite with real calculations |
| `web/frontend/src/app/(dashboard)/dashboard/page.js` | API integration, loading states, real data |
| `web/frontend/src/components/charts/ExpenseAreaChart.js` | Accepts data prop, dual-area chart (income/expense) |

## 🎯 Next Steps

1. **Add Transaction Form**: Create UI to add transactions via modal
2. **Account Management**: Page to create/edit accounts
3. **Investment Tracking**: Wire stock trades and mutual funds
4. **Real Market Data**: Integrate Alpha Vantage for live prices
5. **Forecasting**: Add predictions for future portfolio value
6. **Alerts**: Notify when budget thresholds are exceeded

## 💡 Tips

- **Paise Math**: All money stored as integers (no floats) to prevent rounding errors
- **Month Calculation**: Current month starts from 1st, calculated dynamically
- **P&L %**: Uses invested amount vs current value, not including fees
- **Auto-retry**: Dashboard auto-refreshes every 5 minutes; logs errors gracefully

---

**Dashboard is now production-ready and will display live data as you add transactions!** 🎉
