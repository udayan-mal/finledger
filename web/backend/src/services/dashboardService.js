import { z } from "zod";
import { prisma } from "../config/prisma.js";

const dashboardRangeSchema = z.enum([
  "thisMonth",
  "lastMonth",
  "last30Days",
  "last3Months",
  "lastYear",
  "thisYear",
  "allTime"
]).default("thisMonth");

export const getDashboardSummary = async (userId, rangeKey) => {
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const selectedRangeKey = dashboardRangeSchema.parse(rangeKey);
  const selectedRange = resolveDashboardRange(selectedRangeKey, now);

  const transactionWhere = {
    userId,
    ...(selectedRange.start
      ? { date: { gte: selectedRange.start, lt: selectedRange.endExclusive } }
      : { date: { lt: selectedRange.endExclusive } })
  };

  // Fetch data for the selected range plus the current snapshot items.
  const [accounts, selectedTransactions, stockTrades, mutualFunds, recurringExpenses, sipPlans, sipExecutions] = await Promise.all([
    prisma.account.findMany({
      where: { userId },
      select: { id: true, type: true, balancePaise: true, name: true }
    }),
    prisma.transaction.findMany({
      where: transactionWhere,
      include: { category: true }
    }),
    prisma.stockTrade.findMany({
      where: { userId },
      select: { id: true, symbol: true, qty: true, pricePaise: true, totalChargesPaise: true, tradeType: true, date: true }
    }),
    prisma.mutualFund.findMany({
      where: { userId },
      select: { id: true, fundName: true, units: true, navAtBuyPaise: true, sipAmountPaise: true, sipDate: true, type: true, date: true }
    }),
    prisma.recurringExpense.findMany({
      where: { userId, active: true },
      orderBy: { nextDue: "asc" },
      take: 8
    }),
    prisma.sipPlan.findMany({
      where: { userId, active: true },
      include: { account: { select: { id: true, name: true, type: true } } },
      orderBy: { nextDue: "asc" },
      take: 8
    }),
    prisma.sipExecution.findMany({
      where: { userId, executedAt: { gte: currentMonthStart } },
      include: {
        sipPlan: { select: { fundName: true, platform: true, frequency: true, amountPaise: true } }
      },
      orderBy: { executedAt: "desc" },
      take: 50
    })
  ]);

  // Calculate account balances by type
  const bankCashPaise = accounts
    .filter(a => a.type === "BANK" || a.type === "CASH" || a.type === "WALLET")
    .reduce((sum, a) => sum + a.balancePaise, 0);

  const investmentAccountPaise = accounts
    .filter(a => a.type === "INVESTMENT")
    .reduce((sum, a) => sum + a.balancePaise, 0);

  // Calculate metrics for the selected range.
  const periodIncomePaise = selectedTransactions
    .filter(tx => tx.type === "INCOME")
    .reduce((sum, tx) => sum + tx.amountPaise, 0);

  const periodExpensePaise = selectedTransactions
    .filter(tx => tx.type === "EXPENSE" || tx.type === "INVESTMENT")
    .reduce((sum, tx) => sum + tx.amountPaise, 0);

  const periodInvestmentPaise = selectedTransactions
    .filter(tx => tx.type === "INVESTMENT")
    .reduce((sum, tx) => sum + tx.amountPaise, 0);

  const savingsRatePercent = periodIncomePaise > 0
    ? ((periodIncomePaise - periodExpensePaise) / periodIncomePaise) * 100
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

  const estimatedUnrealized = calculateEstimatedUnrealizedStockPnl(stockTrades);
  const portfolioPnlPercent = estimatedUnrealized.openCostPaise > 0
    ? (estimatedUnrealized.unrealizedPnlPaise / estimatedUnrealized.openCostPaise) * 100
    : 0;
  const realizedPnlPaise = stockTrades
    .filter((trade) => trade.tradeType === "SELL")
    .reduce((sum, trade) => sum + (trade.netPnlPaise || 0), 0);
  const unrealizedPnlPaise = estimatedUnrealized.unrealizedPnlPaise;

  // Get cash flow data for the selected range.
  const cashFlow = calculateCashFlowByPeriod(selectedTransactions, selectedRange);

  // Get expense breakdown by category for the selected range.
  const expenseBreakdown = calculateCategoryBreakdown(
    selectedTransactions.filter(tx => tx.type === "EXPENSE" || tx.type === "INVESTMENT")
  );

  const incomeBreakdown = calculateCategoryBreakdown(
    selectedTransactions.filter(tx => tx.type === "INCOME")
  );

  const totalIncomeCount = selectedTransactions.filter(tx => tx.type === "INCOME").length;
  const totalExpenseCount = selectedTransactions.filter(tx => tx.type === "EXPENSE" || tx.type === "INVESTMENT").length;

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

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const sevenDaysOut = new Date(today);
  sevenDaysOut.setDate(sevenDaysOut.getDate() + 7);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const sipReminders = sipPlans.map((plan) => {
    const nextDue = new Date(plan.nextDue);
    nextDue.setHours(0, 0, 0, 0);
    const isOverdue = nextDue < today;
    const isDueToday = nextDue >= today && nextDue < tomorrow;
    const isUpcoming = nextDue >= tomorrow && nextDue <= sevenDaysOut;
    return {
      id: plan.id,
      fundName: plan.fundName,
      amountPaise: plan.amountPaise,
      frequency: plan.frequency,
      nextDue: plan.nextDue.toISOString(),
      platform: plan.platform,
      type: plan.type,
      active: plan.active,
      account: plan.account,
      isDueToday,
      isOverdue,
      isUpcoming
    };
  });

  const cashRequiredThisMonthPaise = sipReminders
    .filter((item) => {
      const due = new Date(item.nextDue);
      return due >= monthStart && due < monthEnd;
    })
    .reduce((sum, item) => sum + item.amountPaise, 0);

  const monthlyContributionTrend = buildMonthlyContributionTrend(
    selectedTransactions.filter((tx) => tx.type === "INVESTMENT")
  );

  const sipActivityThisMonth = sipExecutions.map((execution) => ({
    id: execution.id,
    status: execution.status,
    amountPaise: execution.amountPaise,
    executedAt: execution.executedAt.toISOString(),
    note: execution.note,
    fundName: execution.sipPlan?.fundName || "SIP",
    platform: execution.sipPlan?.platform || "",
    frequency: execution.sipPlan?.frequency || "",
    source: execution.transactionId ? "Ledger entry created" : "Execution log"
  }));

  const sipActivitySummary = sipExecutions.reduce(
    (summary, execution) => {
      summary.total += 1;
      if (execution.status === "PAID") summary.paid += 1;
      if (execution.status === "SKIPPED") summary.skipped += 1;
      if (execution.status === "SNOOZED") summary.snoozed += 1;
      summary.amountPaise += execution.amountPaise || 0;
      if (execution.status === "PAID") summary.paidAmountPaise += execution.amountPaise || 0;
      return summary;
    },
    { total: 0, paid: 0, skipped: 0, snoozed: 0, amountPaise: 0, paidAmountPaise: 0 }
  );

  const investmentTransactionsThisMonth = selectedTransactions
    .filter((tx) => tx.type === "INVESTMENT")
    .map((tx) => ({
      id: tx.id,
      amountPaise: tx.amountPaise,
      date: tx.date.toISOString(),
      description: tx.description || "Investment",
      note: tx.note || null
    }));

  const paidExecutionsThisMonth = sipExecutions
    .filter((execution) => execution.status === "PAID")
    .map((execution) => ({
      id: execution.id,
      amountPaise: execution.amountPaise,
      executedAt: execution.executedAt.toISOString(),
      transactionId: execution.transactionId,
      fundName: execution.sipPlan?.fundName || "SIP",
      note: execution.note || null
    }));

  const linkedPaidTxIds = new Set(
    paidExecutionsThisMonth
      .filter((execution) => execution.transactionId)
      .map((execution) => execution.transactionId)
  );

  const investmentTxIds = new Set(investmentTransactionsThisMonth.map((tx) => tx.id));

  const ledgerOnlyTransactions = investmentTransactionsThisMonth.filter((tx) => !linkedPaidTxIds.has(tx.id));

  const executionOnlyPaid = paidExecutionsThisMonth.filter(
    (execution) => !execution.transactionId || !investmentTxIds.has(execution.transactionId)
  );

  const reconciliationDetails = {
    matchedCount: paidExecutionsThisMonth.length - executionOnlyPaid.length,
    ledgerOnlyCount: ledgerOnlyTransactions.length,
    executionOnlyCount: executionOnlyPaid.length,
    ledgerOnlyTransactions,
    executionOnlyPaid
  };

  return {
    selectedPeriod: {
      key: selectedRangeKey,
      label: selectedRange.label,
      start: selectedRange.start ? selectedRange.start.toISOString() : null,
      end: selectedRange.endExclusive.toISOString()
    },
    metrics: {
      netWorthPaise,
      monthlyIncomePaise: periodIncomePaise,
      monthlyExpensePaise: periodExpensePaise,
      monthlyInvestmentPaise: periodInvestmentPaise,
      portfolioValuePaise,
      bankCashPaise,
      savingsRatePercent: savingsRatePercent.toFixed(1),
      portfolioPnlPercent: portfolioPnlPercent.toFixed(1),
      realizedPnlPaise,
      unrealizedPnlPaise,
      unrealizedPnlEstimated: estimatedUnrealized.hasPricedPosition,
      totalIncomeCount,
      totalExpenseCount
    },
    cashFlow,
    expenseBreakdown,
    incomeBreakdown,
    holdings: holdings.slice(0, 10),
    stocks: stocks.slice(0, 10),
    upcoming,
    sipReminders,
    sipUpcomingCount: sipReminders.filter((item) => item.isUpcoming).length,
    sipDueCount: sipReminders.filter((item) => item.isDueToday || item.isOverdue).length,
    sipOverdueCount: sipReminders.filter((item) => item.isOverdue).length,
    cashRequiredThisMonthPaise,
    monthlyContributionTrend,
    sipActivityThisMonth,
    sipActivitySummary,
    reconciliationDetails
  };
};

function resolveDashboardRange(rangeKey, now) {
  const startOfDay = (date) => {
    const clone = new Date(date);
    clone.setHours(0, 0, 0, 0);
    return clone;
  };

  const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
  const startOfYear = (date) => new Date(date.getFullYear(), 0, 1);
  const addMonths = (date, amount) => new Date(date.getFullYear(), date.getMonth() + amount, 1);

  switch (rangeKey) {
    case "lastMonth": {
      const start = addMonths(startOfMonth(now), -1);
      const endExclusive = startOfMonth(now);
      return { key: rangeKey, label: "Last Month", start, endExclusive };
    }
    case "last30Days": {
      const endExclusive = now;
      const start = startOfDay(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000));
      return { key: rangeKey, label: "Last 30 Days", start, endExclusive };
    }
    case "last3Months": {
      const start = addMonths(startOfMonth(now), -3);
      const endExclusive = startOfMonth(now);
      return { key: rangeKey, label: "Last 3 Months", start, endExclusive };
    }
    case "lastYear": {
      const start = new Date(now.getFullYear() - 1, 0, 1);
      const endExclusive = startOfYear(now);
      return { key: rangeKey, label: "Last Year", start, endExclusive };
    }
    case "thisYear": {
      const start = startOfYear(now);
      const endExclusive = now;
      return { key: rangeKey, label: "This Year", start, endExclusive };
    }
    case "allTime": {
      return { key: rangeKey, label: "All Time", start: null, endExclusive: now };
    }
    case "thisMonth":
    default: {
      const start = startOfMonth(now);
      const endExclusive = now;
      return { key: "thisMonth", label: "This Month", start, endExclusive };
    }
  }
}

function calculateCashFlowByPeriod(transactions, range) {
  if (!transactions.length) return [];

  const rangeStart = range.start ? new Date(range.start) : new Date(Math.min(...transactions.map((tx) => tx.date.getTime())));
  const rangeEnd = new Date(range.endExclusive);
  const rangeLengthDays = Math.max(1, Math.ceil((rangeEnd - rangeStart) / (24 * 60 * 60 * 1000)));
  const useDailyBuckets = rangeLengthDays <= 45;

  if (useDailyBuckets) {
    const start = new Date(rangeStart);
    start.setHours(0, 0, 0, 0);
    const end = new Date(rangeEnd);
    end.setHours(0, 0, 0, 0);
    const buckets = [];

    for (let cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
      buckets.push(new Date(cursor));
    }

    return buckets.map((date) => {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      const income = transactions
        .filter((tx) => tx.type === "INCOME" && tx.date >= date && tx.date < nextDay)
        .reduce((sum, tx) => sum + tx.amountPaise, 0);
      const expense = transactions
        .filter((tx) => (tx.type === "EXPENSE" || tx.type === "INVESTMENT") && tx.date >= date && tx.date < nextDay)
        .reduce((sum, tx) => sum + tx.amountPaise, 0);

      return {
        month: date.toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
        income: income / 100,
        expense: expense / 100,
        savings: (income - expense) / 100
      };
    });
  }

  const start = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1);
  const end = new Date(rangeEnd.getFullYear(), rangeEnd.getMonth(), 1);
  const buckets = [];

  for (let cursor = new Date(start); cursor <= end; cursor.setMonth(cursor.getMonth() + 1)) {
    buckets.push(new Date(cursor));
  }

  return buckets.map((date) => {
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    const income = transactions
      .filter((tx) => tx.type === "INCOME" && tx.date >= monthStart && tx.date < monthEnd)
      .reduce((sum, tx) => sum + tx.amountPaise, 0);
    const expense = transactions
      .filter((tx) => (tx.type === "EXPENSE" || tx.type === "INVESTMENT") && tx.date >= monthStart && tx.date < monthEnd)
      .reduce((sum, tx) => sum + tx.amountPaise, 0);

    return {
      month: date.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      income: income / 100,
      expense: expense / 100,
      savings: (income - expense) / 100
    };
  });
}

// Helper: Calculate breakdown by category
function calculateCategoryBreakdown(transactions) {
  const categoryTotals = {};

  transactions.forEach(tx => {
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
    .slice(0, 8); // Expanded from 5 to 8 for better visibility
}

function buildMonthlyContributionTrend(transactions) {
  if (!transactions.length) return [];

  const ordered = [...transactions].sort((a, b) => a.date - b.date);
  const start = new Date(ordered[0].date.getFullYear(), ordered[0].date.getMonth(), 1);
  const end = new Date(ordered[ordered.length - 1].date.getFullYear(), ordered[ordered.length - 1].date.getMonth(), 1);
  const monthKeys = [];

  for (let cursor = new Date(start); cursor <= end; cursor.setMonth(cursor.getMonth() + 1)) {
    monthKeys.push(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`);
  }

  const totalByMonth = new Map(monthKeys.map((key) => [key, 0]));

  ordered.forEach((transaction) => {
    const date = new Date(transaction.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (totalByMonth.has(key)) {
      totalByMonth.set(key, totalByMonth.get(key) + (transaction.amountPaise || 0));
    }
  });

  return monthKeys.map((key) => {
    const [year, month] = key.split("-").map(Number);
    return {
      month: new Date(year, month - 1, 1).toLocaleString("en-US", { month: "short", year: "2-digit" }),
      amountPaise: totalByMonth.get(key) || 0,
      amount: (totalByMonth.get(key) || 0) / 100
    };
  });
}

function calculateEstimatedUnrealizedStockPnl(stockTrades) {
  const tradesBySymbol = new Map();

  stockTrades.forEach((trade) => {
    const symbol = (trade.symbol || "").toUpperCase();
    if (!symbol) return;
    if (!tradesBySymbol.has(symbol)) tradesBySymbol.set(symbol, []);
    tradesBySymbol.get(symbol).push(trade);
  });

  let totalUnrealizedPnlPaise = 0;
  let totalOpenCostPaise = 0;
  let hasPricedPosition = false;

  tradesBySymbol.forEach((trades) => {
    const ordered = [...trades].sort((a, b) => new Date(a.date) - new Date(b.date));
    let openQty = 0;
    let openCostPaise = 0;
    let latestPricePaise = 0;

    ordered.forEach((trade) => {
      const qty = Number(trade.qty || 0);
      const pricePaise = Number(trade.pricePaise || 0);
      const chargesPaise = Number(trade.totalChargesPaise || 0);

      if (pricePaise > 0) latestPricePaise = pricePaise;

      if (trade.tradeType === "BUY") {
        openQty += qty;
        openCostPaise += (qty * pricePaise) + chargesPaise;
      } else if (trade.tradeType === "SELL" && openQty > 0) {
        const soldQty = Math.min(qty, openQty);
        const avgCostPerUnit = openQty > 0 ? (openCostPaise / openQty) : 0;
        openQty -= soldQty;
        openCostPaise -= avgCostPerUnit * soldQty;
      }
    });

    if (openQty > 0 && latestPricePaise > 0) {
      const marketValuePaise = openQty * latestPricePaise;
      totalUnrealizedPnlPaise += Math.round(marketValuePaise - openCostPaise);
      totalOpenCostPaise += Math.round(openCostPaise);
      hasPricedPosition = true;
    }
  });

  return {
    unrealizedPnlPaise: totalUnrealizedPnlPaise,
    openCostPaise: totalOpenCostPaise,
    hasPricedPosition
  };
}
