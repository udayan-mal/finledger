# Dashboard Testing Guide

## 🎯 Quick Start (5 minutes)

### 1. Seed Test Data
```bash
cd web/backend
npm run seed:dashboard
```

This creates:
- ✅ Test user (email: `dashboard-test@finledger.com`, password: `TestPassword123!`)
- ✅ 3 bank/cash/investment accounts
- ✅ 6 months of realistic income/expense transactions
- ✅ 3 mutual fund holdings with varying values
- ✅ 7 transaction categories with random expenses

### 2. Start Development Servers

**Terminal 1 - Backend**
```bash
cd web/backend
npm run dev
# Runs on http://localhost:4000
```

**Terminal 2 - Frontend**
```bash
cd web/frontend
npm run dev
# Runs on http://localhost:3000
```

### 3. Login & Test Dashboard

1. Open http://localhost:3000/login
2. Enter credentials:
   - **Email**: `dashboard-test@finledger.com`
   - **Password**: `TestPassword123!`
3. Click Dashboard from sidebar
4. Observe:
   - Loading skeleton animates briefly
   - Real metrics appear with calculated values
   - Charts display 6-month cash flow
   - Holdings table shows mutual funds with P&L

## 📊 Dashboard Features to Verify

### ✅ Metrics Cards (Top Section)

| Metric | Expected Value | Calculation |
|--------|---|---|
| **Total Net Worth** | ₹81,27,750 | Sum of all account balances + portfolio |
| **Total Income (Month)** | ₹35,00,000 | Sum of INCOME transactions in current month |
| **Total Expenses (Month)** | ₹15,000 - ₹30,000 | Sum of EXPENSE transactions (varies by date) |
| **Portfolio Value** | ₹27,33,750 | Sum of MF holdings current value |
| **Bank + Cash Balance** | ₹50,02,500 | BANK + CASH + WALLET account balances |
| **Savings Rate** | 55% - 57% | (Income - Expenses) / Income × 100 |

**How to verify:**
- Net Worth = Bank (₹50,00,000) + Cash (₹2,500) + Investment (₹30,00,000) + MF (₹27,33,750)
- Income = Salary (₹30,00,000) + Freelance (₹5,00,000)
- Savings = (₹35,00,000 - ₹expenses) / ₹35,00,000

### ✅ Cash Flow Chart (6-Month History)

**What you should see:**
- Green area = Income (higher at top)
- Red area = Expenses (lower, stacked above)
- 6 months of data on X-axis
- Hover tooltip shows exact values

**Example:** Jan: Income ₹35L, Expense ₹15-20k, Savings ₹34L+

### ✅ Expense Breakdown (Top 5 Categories)

**Expected breakdown (current month):**
1. Food & Dining: ~40%
2. Transportation: ~25%
3. Shopping: ~20%
4. Entertainment: ~10%
5. Utilities: ~5%

Each category shows:
- Category name
- Amount in rupees (₹)
- Percentage with progress bar

### ✅ Holdings Table (Mutual Funds)

**3 holdings visible:**

| Fund | Units | NAV | Value | P&L |
|------|-------|-----|-------|-----|
| Vanguard Bluechip | 50 | ₹2410.50 | ₹1,20,500 | (calculated) |
| Mirae Asset | 30 | ₹3350.00 | ₹1,00,500 | (calculated) |
| HDFC Top 100 | 25 | ₹1695.00 | ₹42,375 | (calculated) |

P&L = ((Current - Invested) / Invested) × 100 %

## 🧪 Live Testing Scenarios

### Scenario 1: Add New Transaction

**Before:**
- Note current expense total
- Note savings rate

**Action:**
1. Go to All Transactions page
2. Click "Quick Add" button
3. Create expense transaction:
   - Amount: ₹500
   - Category: Food & Dining
   - Date: Today

**After:**
- Refresh dashboard (or wait 5 min auto-refresh)
- Monthly Expenses should increase by ₹500
- Savings Rate should decrease
- Expense Breakdown should update

### Scenario 2: Add Income Transaction

**Action:**
1. Go to All Transactions
2. Add INCOME transaction:
   - Amount: ₹50,000
   - Category: Freelance
   - Date: Today

**Expected:**
- Total Income increases by ₹50,000
- Savings Rate recalculates (higher percentage)
- Cash Flow chart shows updated bar for current month

### Scenario 3: Add New Account

**Action:**
1. Go to Accounts page
2. Create new bank account: "SBI Savings" with ₹1,00,000
3. Return to Dashboard

**Expected:**
- Bank + Cash Balance increases by ₹1,00,000
- Total Net Worth increases by ₹1,00,000
- No impact on income/expense metrics

### Scenario 4: Add Mutual Fund

**Action:**
1. Go to Mutual Funds page
2. Add new holding:
   - Fund: "Axis Growth Fund"
   - Units: 10
   - NAV: ₹3000 per unit
   - Amount: ₹30,000

**Expected:**
- Portfolio Value increases by ₹30,000
- Total Net Worth increases by ₹30,000
- New fund appears in Holdings table
- No impact on income/expense

### Scenario 5: Check Error Handling

**Action:**
1. Disconnect internet or kill backend server
2. Refresh dashboard

**Expected:**
- Error message appears: "Failed to fetch dashboard data"
- Retry button is visible and clickable
- After reconnecting, retry works

## 🔍 Debugging Checklist

### Check API Response

**Using PowerShell:**
```powershell
$headers = @{"Authorization"="Bearer YOUR_JWT_TOKEN"}
$response = Invoke-WebRequest -Uri 'http://localhost:4000/api/v1/dashboard/summary' -Headers $headers
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

**Expected JSON structure:**
```json
{
  "success": true,
  "data": {
    "metrics": {
      "netWorthPaise": 8127750000,
      "monthlyIncomePaise": 3500000000,
      "monthlyExpensePaise": 1000000,
      "portfolioValuePaise": 2733750000,
      "bankCashPaise": 5000250000,
      "savingsRatePercent": "71.4",
      "portfolioPnlPercent": "5.2"
    },
    "cashFlow": [
      {"month":"Oct","income":3500000,"expense":15000,"savings":3485000},
      ...
    ],
    "expenseBreakdown": [
      {"name":"Food & Dining","amount":4000,"percentage":"40"},
      ...
    ],
    "holdings": [...]
  }
}
```

### Check Browser Console

1. Open Chrome DevTools (F12)
2. Go to Console tab
3. Should see no errors
4. Warnings about devDependencies are OK

### Check Network Tab

1. Go to Network tab
2. Look for `dashboard/summary` request
3. Verify:
   - ✅ Status: 200
   - ✅ Method: GET
   - ✅ Response size: 2KB-5KB
   - ✅ Time: <100ms

## 🚀 Performance Testing

### Load Time

**Measure:**
1. Open DevTools → Performance tab
2. Hard refresh (Ctrl+Shift+R)
3. Measure "First Contentful Paint"

**Expected:**
- Skeleton appears in <500ms
- Data loads in <1s
- Charts render in <2s

### Auto-Refresh

**Test:**
1. Add transaction in browser A
2. Watch dashboard in browser B
3. After 5 minutes, metrics should update automatically

**Or force refresh:**
- Open DevTools console
- Run: `window.location.reload()`

## 📋 Test Checklist

- [ ] **Seed Script**: Runs without errors
- [ ] **Login**: Can authenticate with test user
- [ ] **Dashboard Loads**: Skeleton appears briefly
- [ ] **Metrics Display**: All 6 cards show correct values
- [ ] **Cash Flow Chart**: Shows 6 months with income/expense
- [ ] **Expense Breakdown**: Shows top 5 categories
- [ ] **Holdings Table**: Shows 3 mutual funds
- [ ] **Currency Format**: All values show as ₹X,XX,XXX format
- [ ] **Savings Rate**: Calculates correctly (>50%)
- [ ] **Add Transaction**: Metrics update after adding expense
- [ ] **Auto-Refresh**: Dashboard updates after 5 minutes
- [ ] **Error Handling**: Retry works when API fails
- [ ] **Responsive**: Works on mobile viewport
- [ ] **No Console Errors**: DevTools console clean

## 🛠️ Troubleshooting

### Issue: "Failed to fetch dashboard data"

**Solutions:**
1. Verify backend is running on port 4000
2. Check JWT token is valid (login again)
3. Check network tab for CORS errors
4. Verify `DATABASE_URL` is set in backend `.env`

### Issue: "No expenses this month" or blank metrics

**Solutions:**
1. Verify seed script created transactions
2. Check database with: `npm run prisma:studio`
3. Verify transactions have today's date range
4. Run seed again: `npm run seed:dashboard`

### Issue: Chart doesn't show income/expense

**Solutions:**
1. Verify `cashFlow` data in API response
2. Check ExpenseAreaChart receives data prop correctly
3. Verify categories are created and linked to transactions

### Issue: Loading skeleton stuck forever

**Solutions:**
1. Check browser console for errors
2. Verify backend API responds: `curl http://localhost:4000/api/v1/dashboard/summary`
3. Kill and restart frontend dev server
4. Clear browser cache (Ctrl+Shift+Delete)

## 📚 Additional Resources

- [Dashboard Integration Guide](./DASHBOARD_INTEGRATION.md) - Detailed feature documentation
- [API Documentation](./web/backend/API.md) - Complete API reference
- [Architecture Guide](./ARCHITECTURE.md) - System design overview

## 🎬 Step-by-Step Video Test Flow

1. **Setup (2 min)**
   - Seed data
   - Start servers
   - Login

2. **Verify Metrics (1 min)**
   - Check all 6 values match expectations
   - Verify currency formatting

3. **Check Charts (1 min)**
   - View 6-month cash flow
   - Hover to see tooltip
   - Check expense breakdown colors

4. **Display Table (1 min)**
   - Scroll holdings table
   - Verify 3 funds visible
   - Check P&L calculations

5. **Add Transaction (1 min)**
   - Create expense in modal
   - Refresh dashboard
   - Verify metrics updated

6. **Test Error (30 sec)**
   - Stop backend server
   - Refresh dashboard
   - Click retry button

**Total: ~5 minutes to validate full dashboard functionality**

---

**Pro Tip**: Bookmark `http://localhost:3000/dashboard` for quick testing after login!
