"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
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
function DashMetric({ label, value, subtitle, accent = false, icon, trend, trendLabel }) {
  return (
    <div className="glass-panel p-5 rounded-xl border-t border-tertiary/20 hover:-translate-y-0.5 transition-transform duration-200 group">
      {/* Top row: icon + label */}
      <div className="flex items-center gap-2 mb-3">
        {icon && (
          <span className="material-symbols-outlined text-[18px] text-on-surface-variant/50 group-hover:text-tertiary transition-colors">
            {icon}
          </span>
        )}
        <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/60">
          {label}
        </p>
      </div>

      {/* Value */}
      <p className={`font-mono text-2xl font-bold leading-tight ${accent ? "text-tertiary" : "text-on-surface"}`}>
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
  );
}

/* ──────────────────────────────────────────────
   Expense Donut — pure CSS ring chart
   ────────────────────────────────────────────── */
const DONUT_COLORS = ["#e6c364", "#8b7832", "#c9a84c", "#6b5e30", "#a88d3e"];

function ExpenseDonut({ breakdown, totalExpense }) {
  if (!breakdown || breakdown.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <div className="w-32 h-32 rounded-full border-[8px] border-outline-variant/15 flex items-center justify-center">
          <span className="font-mono text-sm text-on-surface-variant/40">No data</span>
        </div>
        <p className="text-on-surface-variant/40 text-xs font-mono text-center">Add expenses to see breakdown</p>
      </div>
    );
  }

  // Build conic-gradient segments
  let cumulative = 0;
  const segments = breakdown.map((item, i) => {
    const start = cumulative;
    cumulative += parseFloat(item.percentage);
    return `${DONUT_COLORS[i % DONUT_COLORS.length]} ${start}% ${cumulative}%`;
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
          <span className="font-mono text-sm font-bold text-on-surface">{fmtINR(totalExpense * 100)}</span>
          <span className="font-mono text-[8px] text-on-surface-variant/50 uppercase">This Month</span>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2 w-full">
        {breakdown.map((item, i) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
              <span className="text-xs text-on-surface truncate max-w-[120px]">{item.name}</span>
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
      const res = await fetch("/api/v1/dashboard/summary");
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
        setError(null);
      } else if (res.status === 401) {
        // Not logged in — show empty state
        setData(null);
        setError(null);
      } else {
        setData(null);
      }
    } catch {
      // Backend not available — show empty state gracefully
      setData(null);
      setError(null);
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
  const upcoming = data?.upcoming || [];

  const totalMonthlyExpense = expenseBreakdown.reduce((s, e) => s + (e.amount || 0), 0);

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
        />
        <DashMetric
          label="Total Income (Month)"
          value={fmtINR(m.monthlyIncomePaise)}
          subtitle="Current month"
          icon="trending_up"
          accent={m.monthlyIncomePaise > 0}
        />
        <DashMetric
          label="Total Expenses (Month)"
          value={fmtINR(m.monthlyExpensePaise)}
          subtitle="Current month"
          icon="trending_down"
        />
        <DashMetric
          label="Portfolio Value"
          value={fmtINR(m.portfolioValuePaise)}
          subtitle={fmtINRDecimal(m.portfolioValuePaise)}
          icon="pie_chart"
          accent={m.portfolioValuePaise > 0}
          trend={parseFloat(m.portfolioPnlPercent || 0)}
          trendLabel={`${m.portfolioPnlPercent || 0}% P&L`}
        />
        <DashMetric
          label="Bank + Cash Balance"
          value={fmtINR(m.bankCashPaise)}
          subtitle="Across all accounts"
          icon="savings"
        />
        <DashMetric
          label="Savings Rate"
          value={`${m.savingsRatePercent || 0}%`}
          subtitle="Income – Expenses"
          icon="speed"
          accent={parseFloat(m.savingsRatePercent || 0) > 30}
        />
      </section>

      {/* ── Main Widgets 2×2 Grid ── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ─ Cash Flow — Last 6 Months ─ */}
        <div className="glass-panel rounded-xl p-6 lg:p-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-tertiary text-[20px]">bar_chart</span>
            <h2 className="font-headline text-xl text-on-surface">Cash Flow — Last 6 Months</h2>
          </div>
          <p className="text-on-surface-variant/40 text-xs font-mono mb-6">Income vs Expenses by month</p>

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
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-tertiary text-[20px]">donut_large</span>
            <h2 className="font-headline text-xl text-on-surface">Expense Breakdown</h2>
          </div>
          <p className="text-on-surface-variant/40 text-xs font-mono mb-6">Category-wise spending this month</p>

          <div className="flex items-center justify-center min-h-[260px]">
            <ExpenseDonut breakdown={expenseBreakdown} totalExpense={totalMonthlyExpense} />
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

        {/* ─ Upcoming Recurring ─ */}
        <div className="glass-panel rounded-xl p-6 lg:p-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-tertiary text-[20px]">event_repeat</span>
            <h2 className="font-headline text-xl text-on-surface">Upcoming Recurring</h2>
          </div>
          <p className="text-on-surface-variant/40 text-xs font-mono mb-6">Scheduled bills and subscriptions</p>

          {upcoming.length > 0 ? (
            <div className="space-y-3">
              {upcoming.map((item) => {
                const due = new Date(item.nextDue);
                const dueStr = due.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
                const daysUntil = Math.ceil((due - new Date()) / (1000 * 60 * 60 * 24));
                const urgent = daysUntil <= 3;

                return (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-surface-container/40 hover:bg-surface-container/70 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${urgent ? "bg-red-500/10" : "bg-surface-container-highest/50"}`}>
                        <span className={`material-symbols-outlined text-[16px] ${urgent ? "text-red-400" : "text-on-surface-variant/50"}`}>
                          {item.frequency === "Monthly" ? "calendar_month" : "event"}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-on-surface">{item.name}</p>
                        <p className="font-mono text-[10px] text-on-surface-variant/50">
                          {dueStr} · {item.frequency}
                          {urgent && <span className="text-red-400 ml-1">({daysUntil <= 0 ? "Overdue" : `${daysUntil}d`})</span>}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-sm font-bold text-on-surface">{fmtINR(item.amountPaise)}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[200px] gap-3">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/15">event_repeat</span>
              <p className="text-on-surface-variant/40 text-xs font-mono text-center">
                No recurring expenses yet.<br/>Add bills and subscriptions to track them here.
              </p>
              <Link
                href="/recurring"
                className="mt-2 px-4 py-2 rounded-lg border border-outline-variant/20 text-xs font-mono text-on-surface-variant hover:border-tertiary hover:text-tertiary transition-colors"
              >
                Manage Recurring →
              </Link>
            </div>
          )}
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
