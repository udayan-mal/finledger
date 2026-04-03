import { prisma } from "../config/prisma.js";

export const getDashboardSummary = async (userId) => {
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

  // Fetch all data in parallel
  const [accounts, monthlyTransactions, allTransactionsLast6M, stockTrades, mutualFunds] = await Promise.all([
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
      select: { id: true, symbol: true, quantity: true, pricePaise: true, totalChargesPaise: true, tradeType: true }
    }),
    prisma.mutualFund.findMany({
      where: { userId },
      select: { id: true, fundName: true, units: true, navAtBuyPaise: true, investedAmountPaise: true }
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

  // Calculate portfolio value (using last NAV as current value)
  const portfolioValuePaise = mutualFunds.reduce((sum, mf) => sum + (mf.navAtBuyPaise || 0), 0);
  const totalInvestedPaise = mutualFunds.reduce((sum, mf) => sum + (mf.investedAmountPaise || 0), 0);

  // Calculate net worth
  const netWorthPaise = bankCashPaise + investmentAccountPaise + portfolioValuePaise;

  // Calculate portfolio P&L
  const portfolioPnlPaise = portfolioValuePaise - totalInvestedPaise;
  const portfolioPnlPercent = totalInvestedPaise > 0 ? (portfolioPnlPaise / totalInvestedPaise) * 100 : 0;

  // Get last 6 months cash flow data (grouped by month)
  const cashFlowByMonth = calculateCashFlowByMonth(allTransactionsLast6M, sixMonthsAgo);

  // Get expense breakdown by category (current month)
  const expenseBreakdown = calculateExpenseBreakdown(
    monthlyTransactions.filter(tx => tx.type === "EXPENSE")
  );

  // Get holdings for table
  const holdings = mutualFunds.map(mf => ({
    id: mf.id,
    name: mf.fundName,
    units: (mf.units / 10000).toFixed(2), // Convert from internal units
    navAtBuyPaise: (mf.navAtBuyPaise / 100).toFixed(2), // Convert paise to rupees
    currentValue: (mf.navAtBuyPaise / 100).toFixed(2), // Using same as NAV for now
    pnlPercent: totalInvestedPaise > 0 
      ? (((mf.navAtBuyPaise - mf.investedAmountPaise) / mf.investedAmountPaise) * 100).toFixed(1)
      : 0
  }));

  const stocks = stockTrades.map(st => ({
    id: st.id,
    name: st.symbol,
    quantity: st.quantity,
    avgCost: (st.pricePaise / 100).toFixed(2),
    currentValue: (st.pricePaise / 100).toFixed(2),
    pnlPercent: 0 // Would need current market data
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
    cashFlow: cashFlowByMonth,
    expenseBreakdown,
    holdings: holdings.slice(0, 10), // Top 10 holdings
    stocks: stocks.slice(0, 10)
  };
};

// Helper: Group transactions by month for cash flow chart
function calculateCashFlowByMonth(transactions, startDate) {
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

  const data = months.map(m => {
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
      income: income / 100, // Convert paise to rupees
      expense: expense / 100,
      savings: (income - expense) / 100
    };
  });

  return data;
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
      amount: amount / 100, // Convert paise to rupees
      percentage: total > 0 ? ((amount / total) * 100).toFixed(1) : 0
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5); // Top 5 categories
}
