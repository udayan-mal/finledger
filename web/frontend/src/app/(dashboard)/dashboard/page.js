"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { apiGetCached } from "@/lib/api";
import ExpenseAreaChart from "@/components/charts/ExpenseAreaChart";

/* ──────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────── */
const fmtINR = (paise) => {
  const rupees = (paise || 0) / 100;
  return `₹${rupees.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

const fmtINRDecimal = (paise) => {
  const rupees = (paise || 0) / 100;
  return `₹${rupees.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/* ──────────────────────────────────────────────
   Metric Card — designed for the 6-card grid
   ────────────────────────────────────────────── */
function DashMetric({ label, value, subtitle, accent = false, valueColor, iconColor, icon, trend, trendLabel, gradient }) {
  // Determine standard colors or use custom ones
  const defaultValColor = accent ? "text-tertiary" : "text-on-surface";
  const finalValueColor = valueColor || defaultValColor;
  
  const defaultIconColor = "text-on-surface-variant/50 group-hover:text-tertiary";
  const finalIconColor = iconColor ? `${iconColor} opacity-70 group-hover:opacity-100` : defaultIconColor;

  return (
    <div className={`glass-panel p-5 rounded-xl border border-white/5 hover:border-white/10 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#C9A84C]/5 transition-all duration-300 group relative overflow-hidden`}>
      {/* Subtle background glow */}
      {gradient && (
        <div className={`absolute -inset-10 opacity-20 pointer-events-none blur-3xl ${gradient}`} />
      )}
      
      <div className="relative z-10">
        {/* Top row: icon + label */}
        <div className="flex items-center gap-2 mb-3">
          {icon && (
            <span className={`material-symbols-outlined text-[18px] transition-colors ${finalIconColor}`}>
              {icon}
            </span>
          )}
          <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/60">
            {label}
          </p>
        </div>

        {/* Value */}
        <p className={`font-mono text-2xl font-bold leading-tight drop-shadow-md ${finalValueColor}`}>
          {value}
        </p>

        {/* Subtitle / Trend */}
        <div className="flex items-center gap-1.5 mt-1.5">
          {trend !== undefined && trend !== 0 && (
            <span className={`material-symbols-outlined text-[14px] ${trend > 0 ? "text-green-400" : "text-red-400"}`}>
              {trend > 0 ? "trending_up" : "trending_down"}
            </span>
          )}
          <p className="font-mono text-[10px] text-on-surface-variant/40">
            {trendLabel || subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Category Donut — pure CSS ring chart
   ────────────────────────────────────────────── */
const VIBRANT_PALETTE = ["#3b82f6", "#8b5cf6", "#14b8a6", "#f97316", "#ec4899", "#0ea5e9", "#f43f5e", "#84cc16"];
const INCOME_PALETTE = ["#4ade80", "#2dd4bf", "#10b981", "#60a5fa", "#a78bfa", "#f472b6", "#fbbf24", "#34d399"];

const getColorForCategory = (name, index, type = "expense") => {
  const n = (name || "").toLowerCase();
  
  if (type === "income") {
    if (n.includes("salary") || n.includes("gain") || n.includes("profit") || n.includes("cashback")) return "#4ade80"; // Bright Green
    return INCOME_PALETTE[index % INCOME_PALETTE.length];
  } else {
    if (n.includes("loss")) return "#f87171"; // Red
    if (n.includes("gain") || n.includes("profit") || n.includes("income")) return "#4ade80"; // Green
    if (n.includes("mutual fund") || n.includes("investment")) return "#C9A84C"; // Gold
    return VIBRANT_PALETTE[index % VIBRANT_PALETTE.length];
  }
};

function CategoryDonut({ breakdown, totalAmount, type = "expense", emptyMessage = "Add transactions" }) {
  if (!breakdown || breakdown.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <div className="w-32 h-32 rounded-full border-[8px] border-outline-variant/15 flex items-center justify-center">
          <span className="font-mono text-sm text-on-surface-variant/40">No data</span>
        </div>
        <p className="text-on-surface-variant/40 text-xs font-mono text-center">{emptyMessage}</p>
      </div>
    );
  }

  // Build conic-gradient segments
  let cumulative = 0;
  const segments = breakdown.map((item, i) => {
    const start = cumulative;
    cumulative += parseFloat(item.percentage);
    return `${getColorForCategory(item.name, i, type)} ${start}% ${cumulative}%`;
  });
  const remaining = 100 - cumulative;
  if (remaining > 0) segments.push(`rgba(77,70,55,0.15) ${cumulative}% 100%`);

  return (
    <div className="flex flex-col items-center gap-5">
      {/* CSS Donut */}
      <div className="relative w-36 h-36">
        <div
          className="w-full h-full rounded-full"
          style={{
            background: `conic-gradient(${segments.join(", ")})`,
            WebkitMask: "radial-gradient(circle, transparent 55%, black 56%)",
            mask: "radial-gradient(circle, transparent 55%, black 56%)"
          }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-mono text-sm font-bold ${type === "income" ? "text-green-400" : "text-on-surface"}`}>{fmtINR(totalAmount * 100)}</span>
          <span className="font-mono text-[8px] text-on-surface-variant/50 uppercase">This Month</span>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2 w-full max-h-[140px] overflow-y-auto no-scrollbar pr-2">
        {breakdown.map((item, i) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full shadow-sm" style={{ background: getColorForCategory(item.name, i, type) }} />
              <span className="text-xs text-on-surface truncate max-w-[120px]" title={item.name}>{item.name}</span>
            </div>
            <span className="font-mono text-[10px] text-on-surface-variant">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Main Dashboard Page
   ────────────────────────────────────────────── */
export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiGetCached("/dashboard/summary", { ttlMs: 20000 });
      setData(res.data.data);
      setError(null);
    } catch (err) {
      if (err.response?.status === 401) {
        setData(null);
        setError(null);
      } else {
        setData(null);
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Extract metrics (fallback to zeros)
  const m = data?.metrics || {};
  const cashFlow = data?.cashFlow || [];
  const expenseBreakdown = data?.expenseBreakdown || [];
  const incomeBreakdown = data?.incomeBreakdown || [];

  const totalMonthlyExpense = expenseBreakdown.reduce((s, e) => s + (e.amount || 0), 0);
  const totalMonthlyIncome = incomeBreakdown.reduce((s, e) => s + (e.amount || 0), 0);

  return (
    <div className="space-y-10">

      {/* ── Page Title ── */}
      <div>
        <h1 className="font-headline text-3xl text-on-surface">Dashboard</h1>
        <p className="text-on-surface-variant/60 text-sm mt-1">Your complete financial overview at a glance</p>
      </div>

      {/* ── 6 Metric Cards ── */}
      <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <DashMetric
          label="Total Net Worth"
          value={fmtINR(m.netWorthPaise)}
          subtitle="All assets combined"
          icon="account_balance"
          gradient="bg-[#C9A84C]/20"
          valueColor="text-white"
        />
        <DashMetric
          label="Total Income (Month)"
          value={fmtINR(m.monthlyIncomePaise)}
          subtitle="Current month"
          icon="trending_up"
          valueColor="text-green-400"
          iconColor="text-green-400"
          gradient="bg-green-500/10"
        />
        <DashMetric
          label="Total Expenses (Month)"
          value={fmtINR(m.monthlyExpensePaise)}
          subtitle="Current month"
          icon="trending_down"
          valueColor="text-red-400"
          iconColor="text-red-400"
          gradient="bg-red-500/10"
        />
        <DashMetric
          label="Portfolio Value"
          value={fmtINR(m.portfolioValuePaise)}
          subtitle={fmtINRDecimal(m.portfolioValuePaise)}
          icon="pie_chart"
          valueColor="text-[#C9A84C]"
          iconColor="text-[#C9A84C]"
          trend={parseFloat(m.portfolioPnlPercent || 0)}
          trendLabel={`${m.portfolioPnlPercent || 0}% P&L`}
          gradient="bg-[#C9A84C]/10"
        />
        <DashMetric
          label="Bank + Cash Balance"
          value={fmtINR(m.bankCashPaise)}
          subtitle="Across all accounts"
          icon="savings"
          valueColor="text-blue-300"
          iconColor="text-blue-300"
          gradient="bg-blue-500/10"
        />
        <DashMetric
          label="Savings Rate"
          value={`${m.savingsRatePercent || 0}%`}
          subtitle="Income – Expenses"
          icon="speed"
          valueColor={parseFloat(m.savingsRatePercent || 0) > 30 ? "text-green-400" : "text-white"}
          iconColor={parseFloat(m.savingsRatePercent || 0) > 30 ? "text-green-400" : "text-white"}
        />
      </section>

      {/* ── Main Widgets 2×2 Grid ── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ─ Cash Flow — Last 6 Months ─ */}
        <div className="glass-panel rounded-xl p-6 lg:p-8 relative">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary text-[20px]">bar_chart</span>
              <h2 className="font-headline text-xl text-on-surface">Cash Flow — Last 6 Months</h2>
            </div>
          </div>
          <div className="flex items-center justify-between mb-6">
            <p className="text-on-surface-variant/40 text-xs font-mono">Income vs Expenses by month</p>
            <div className="flex items-center gap-4 border border-outline-variant/10 bg-surface-container-low px-3 py-1.5 rounded-lg">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                <span className="font-mono text-[10px] text-on-surface-variant/60 uppercase tracking-widest">No. of Income <span className="text-on-surface font-bold ml-1">{m.totalIncomeCount || 0}</span></span>
              </div>
              <div className="w-px h-3 bg-outline-variant/20"></div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                <span className="font-mono text-[10px] text-on-surface-variant/60 uppercase tracking-widest">No. of Expenses <span className="text-on-surface font-bold ml-1">{m.totalExpenseCount || 0}</span></span>
              </div>
            </div>
          </div>

          {cashFlow.length > 0 && cashFlow.some(d => d.income > 0 || d.expense > 0) ? (
            <div className="h-72">
              <ExpenseAreaChart data={cashFlow} />
            </div>
          ) : (
            <div className="h-72 flex flex-col items-center justify-center gap-3">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/15">show_chart</span>
              <p className="text-on-surface-variant/40 text-xs font-mono text-center">Add income and expense transactions<br/>to see your cash flow chart</p>
            </div>
          )}
        </div>

        {/* ─ Expense Breakdown ─ */}
        <div className="glass-panel rounded-xl p-6 lg:p-8">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-red-400/80 text-[20px]">pie_chart</span>
              <h2 className="font-headline text-xl text-on-surface">Expense Breakdown</h2>
            </div>
            <p className="text-red-400/80 font-mono text-xs">{fmtINR(totalMonthlyExpense * 100)}</p>
          </div>
          <p className="text-on-surface-variant/40 text-xs font-mono mb-6">Category-wise spending this month</p>

          <div className="flex items-center justify-center min-h-[260px]">
            <CategoryDonut breakdown={expenseBreakdown} totalAmount={totalMonthlyExpense} type="expense" emptyMessage="Add expenses to see breakdown" />
          </div>
        </div>

        {/* ─ AI Insights ─ */}
        <div className="glass-panel rounded-xl p-6 lg:p-8 relative overflow-hidden border border-tertiary/10">
          {/* Subtle gold glow in bg */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-tertiary/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary text-[20px]">auto_awesome</span>
              <h2 className="font-headline text-xl text-on-surface">AI Insights</h2>
            </div>
            <Link
              href="/advisor"
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container-highest/50 hover:bg-surface-container-highest text-xs font-mono text-on-surface-variant hover:text-tertiary transition-all"
            >
              View Chat
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>

          <div className="flex items-start gap-4 mt-6">
            <div className="w-10 h-10 rounded-xl gold-sheen flex items-center justify-center flex-shrink-0">
              <span className="text-lg">💡</span>
            </div>
            <div>
              <p className="text-on-surface text-sm leading-relaxed">
                {(m.monthlyIncomePaise > 0 || m.monthlyExpensePaise > 0)
                  ? `This month you've earned ${fmtINR(m.monthlyIncomePaise)} and spent ${fmtINR(m.monthlyExpensePaise)}. Your savings rate is ${m.savingsRatePercent || 0}%. ${parseFloat(m.savingsRatePercent || 0) >= 30 ? "Great job maintaining a healthy savings rate!" : "Consider reducing discretionary spending to boost your savings."}`
                  : "Add transactions to unlock personalised insights and AI-powered spending analysis."
                }
              </p>
              <div className="flex items-center gap-2 mt-4">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="font-mono text-[10px] text-on-surface-variant/50 uppercase tracking-widest">AI advisor ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─ Income Breakdown ─ */}
        <div className="glass-panel rounded-xl p-6 lg:p-8">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-green-400/80 text-[20px]">donut_large</span>
              <h2 className="font-headline text-xl text-on-surface">Income Breakdown</h2>
            </div>
            <p className="text-green-400/80 font-mono text-xs">+{fmtINR(totalMonthlyIncome * 100)}</p>
          </div>
          <p className="text-on-surface-variant/40 text-xs font-mono mb-6">Sources of revenue this month</p>

          <div className="flex items-center justify-center min-h-[260px]">
            <CategoryDonut breakdown={incomeBreakdown} totalAmount={totalMonthlyIncome} type="income" emptyMessage="Add income transactions" />
          </div>
        </div>
      </section>

      {/* ── Loading skeleton overlay ── */}
      {loading && (
        <div className="fixed inset-0 z-50 bg-surface/80 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-tertiary border-t-transparent rounded-full animate-spin" />
            <span className="font-mono text-xs text-on-surface-variant/60">Loading dashboard...</span>
          </div>
        </div>
      )}
    </div>
  );
}
