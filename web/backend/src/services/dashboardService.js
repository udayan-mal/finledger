import { prisma } from "../config/prisma.js";

export const getDashboardSummary = async (userId) => {
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

  // Fetch all data in parallel
  const [accounts, monthlyTransactions, allTransactionsLast6M, stockTrades, mutualFunds, recurringExpenses] = await Promise.all([
    prisma.account.findMany({
      where: { userId },
      select: { id: true, type: true, balancePaise: true, name: true }
    }),
    prisma.transaction.findMany({
      where: { userId, date: { gte: currentMonthStart } },
      include: { category: true }
    }),
    prisma.transaction.findMany({
      where: { userId, date: { gte: sixMonthsAgo } },
      include: { category: true }
    }),
    prisma.stockTrade.findMany({
      where: { userId },
      select: { id: true, symbol: true, qty: true, pricePaise: true, totalChargesPaise: true, tradeType: true }
    }),
    prisma.mutualFund.findMany({
      where: { userId },
      select: { id: true, fundName: true, units: true, navAtBuyPaise: true, sipAmountPaise: true, sipDate: true, type: true, date: true }
    }),
    prisma.recurringExpense.findMany({
      where: { userId, active: true },
      orderBy: { nextDue: "asc" },
      take: 8
    })
  ]);

  // Calculate account balances by type
  const bankCashPaise = accounts
    .filter(a => a.type === "BANK" || a.type === "CASH" || a.type === "WALLET")
    .reduce((sum, a) => sum + a.balancePaise, 0);

  const investmentAccountPaise = accounts
    .filter(a => a.type === "INVESTMENT")
    .reduce((sum, a) => sum + a.balancePaise, 0);

  // Calculate monthly metrics
  const monthlyIncomePaise = monthlyTransactions
    .filter(tx => tx.type === "INCOME")
    .reduce((sum, tx) => sum + tx.amountPaise, 0);

  const monthlyExpensePaise = monthlyTransactions
    .filter(tx => tx.type === "EXPENSE")
    .reduce((sum, tx) => sum + tx.amountPaise, 0);

  const savingsRatePercent = monthlyIncomePaise > 0
    ? ((monthlyIncomePaise - monthlyExpensePaise) / monthlyIncomePaise) * 100
    : 0;

  // Calculate portfolio value from MF (units * navAtBuy as proxy for current value)
  const portfolioValuePaise = mutualFunds.reduce((sum, mf) => {
    const units = parseFloat(mf.units) || 0;
    return sum + Math.round(units * mf.navAtBuyPaise);
  }, 0);

  // Calculate total invested from stock trades
  const stockInvestedPaise = stockTrades.reduce((sum, st) => {
    if (st.tradeType === "BUY") return sum + (st.qty * st.pricePaise) + (st.totalChargesPaise || 0);
    return sum;
  }, 0);

  // Calculate net worth
  const netWorthPaise = bankCashPaise + investmentAccountPaise + portfolioValuePaise + stockInvestedPaise;

  // Portfolio P&L (would need real current NAV for accuracy)
  const portfolioPnlPercent = 0; // Needs live data

  // Get last 6 months cash flow data (grouped by month)
  const cashFlow = calculateCashFlowByMonth(allTransactionsLast6M);

  // Get expense breakdown by category (current month)
  const expenseBreakdown = calculateExpenseBreakdown(
    monthlyTransactions.filter(tx => tx.type === "EXPENSE")
  );

  // Get holdings for table
  const holdings = mutualFunds.map(mf => ({
    id: mf.id,
    name: mf.fundName,
    units: parseFloat(mf.units).toFixed(2),
    navAtBuy: (mf.navAtBuyPaise / 100).toFixed(2),
    currentValue: (parseFloat(mf.units) * mf.navAtBuyPaise / 100).toFixed(2),
    sipAmountPaise: mf.sipAmountPaise,
    sipDate: mf.sipDate,
    type: mf.type,
    pnlPercent: "0.0"
  }));

  const stocks = stockTrades.map(st => ({
    id: st.id,
    name: st.symbol,
    qty: st.qty,
    avgCost: (st.pricePaise / 100).toFixed(2),
    currentValue: (st.pricePaise / 100).toFixed(2),
    pnlPercent: 0
  }));

  // Format recurring expenses for frontend
  const upcoming = recurringExpenses.map(r => ({
    id: r.id,
    name: r.name,
    amountPaise: r.amountPaise,
    frequency: r.frequency,
    nextDue: r.nextDue.toISOString(),
    active: r.active
  }));

  return {
    metrics: {
      netWorthPaise,
      monthlyIncomePaise,
      monthlyExpensePaise,
      portfolioValuePaise,
      bankCashPaise,
      savingsRatePercent: savingsRatePercent.toFixed(1),
      portfolioPnlPercent: portfolioPnlPercent.toFixed(1)
    },
    cashFlow,
    expenseBreakdown,
    holdings: holdings.slice(0, 10),
    stocks: stocks.slice(0, 10),
    upcoming
  };
};

// Helper: Group transactions by month for cash flow chart
function calculateCashFlowByMonth(transactions) {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    months.push({
      month: date.toLocaleString("en-US", { month: "short" }),
      monthNum: date.getMonth(),
      year: date.getFullYear()
    });
  }

  return months.map(m => {
    const monthStart = new Date(m.year, m.monthNum, 1);
    const monthEnd = new Date(m.year, m.monthNum + 1, 1);

    const income = transactions
      .filter(tx => tx.type === "INCOME" && tx.date >= monthStart && tx.date < monthEnd)
      .reduce((sum, tx) => sum + tx.amountPaise, 0);

    const expense = transactions
      .filter(tx => tx.type === "EXPENSE" && tx.date >= monthStart && tx.date < monthEnd)
      .reduce((sum, tx) => sum + tx.amountPaise, 0);

    return {
      month: m.month,
      income: income / 100,
      expense: expense / 100,
      savings: (income - expense) / 100
    };
  });
}

// Helper: Calculate expense breakdown by category
function calculateExpenseBreakdown(expenses) {
  const categoryTotals = {};

  expenses.forEach(tx => {
    const categoryName = tx.category?.name || "Uncategorized";
    if (!categoryTotals[categoryName]) {
      categoryTotals[categoryName] = 0;
    }
    categoryTotals[categoryName] += tx.amountPaise;
  });

  const total = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

  return Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      name: category,
      amount: amount / 100,
      percentage: total > 0 ? ((amount / total) * 100).toFixed(1) : 0
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);
}
