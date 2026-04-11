"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

const PERIODS = [
  { label: "This Month", key: "monthly", getRange: () => {
    const now = new Date();
    return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: now };
  }},
  { label: "This Quarter", key: "quarterly", getRange: () => {
    const now = new Date();
    const qStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
    return { start: qStart, end: now };
  }},
  { label: "This Year", key: "yearly", getRange: () => {
    const now = new Date();
    return { start: new Date(now.getFullYear(), 0, 1), end: now };
  }},
  { label: "Last 30 Days", key: "last30", getRange: () => {
    const now = new Date();
    return { start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), end: now };
  }},
  { label: "Last 90 Days", key: "last90", getRange: () => {
    const now = new Date();
    return { start: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), end: now };
  }}
];

export default function ReportsPage() {
  const [activePeriod, setActivePeriod] = useState("monthly");
  const [reportData, setReportData] = useState(null);
  const [cashFlow, setCashFlow] = useState([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReport(activePeriod);
    // Also get the dashboard data for charts
    api.get("/dashboard/summary")
      .then(res => {
        const d = res.data.data;
        setCashFlow(d?.cashFlow || []);
        setExpenseBreakdown(d?.expenseBreakdown || []);
      })
      .catch(() => {});
  }, []);

  const fetchReport = async (periodKey) => {
    setIsLoading(true);
    setActivePeriod(periodKey);
    const period = PERIODS.find(p => p.key === periodKey);
    if (!period) return;
    
    const { start, end } = period.getRange();
    try {
      const res = await api.get("/reports/range", {
        params: {
          start: start.toISOString(),
          end: end.toISOString(),
          type: periodKey
        }
      });
      setReportData(res.data.data);
    } catch (err) {
      console.error("Report error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (paise) => `₹${((paise || 0) / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  
  const income = reportData?.totals?.incomePaise || 0;
  const expense = reportData?.totals?.expensePaise || 0;
  const savings = income - expense;

  const DONUT_COLORS = ["#e6c364", "#8b7832", "#c9a84c", "#6b5e30", "#a88d3e"];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="font-headline text-3xl text-on-surface">Reports & Analytics</h2>
        <p className="text-on-surface-variant/60 text-sm font-mono mt-1 uppercase tracking-widest">Financial intelligence across time ranges</p>
      </div>

      {/* Period Filter Chips */}
      <div className="flex gap-2 flex-wrap">
        {PERIODS.map(p => (
          <button
            key={p.key}
            onClick={() => fetchReport(p.key)}
            className={`px-4 py-2 rounded-lg font-mono text-[10px] uppercase tracking-widest transition-all duration-200 ${
              activePeriod === p.key
                ? "bg-[#C9A84C] text-[#0d0d1a] font-bold shadow-[0_2px_10px_0_rgba(201,168,76,0.2)]"
                : "text-[#F1F0EC]/40 hover:text-[#F1F0EC] hover:bg-[#1a1a28] border border-outline-variant/10"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="glass-panel p-24 flex flex-col items-center justify-center gap-4 rounded-xl shadow-2xl">
          <span className="material-symbols-outlined text-[32px] text-[#C9A84C] animate-spin">refresh</span>
          <p className="font-mono text-xs uppercase tracking-widest text-[#F1F0EC]/60">Analyzing Financial Data...</p>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-xl border border-outline-variant/10 shadow-xl bg-[#0d0d1a] text-center">
              <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-2">Total Income</p>
              <p className="font-mono text-2xl font-bold text-green-400">{formatCurrency(income)}</p>
            </div>
            <div className="glass-panel p-6 rounded-xl border border-outline-variant/10 shadow-xl bg-[#0d0d1a] text-center">
              <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-2">Total Expenses</p>
              <p className="font-mono text-2xl font-bold text-red-400">{formatCurrency(expense)}</p>
            </div>
            <div className="glass-panel p-6 rounded-xl border border-outline-variant/10 shadow-xl bg-[#0d0d1a] text-center">
              <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-2">Net Savings</p>
              <p className={`font-mono text-2xl font-bold ${savings >= 0 ? "text-[#C9A84C]" : "text-red-400"}`}>{formatCurrency(savings)}</p>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cash Flow Chart */}
            <div className="glass-panel rounded-xl p-8 border border-outline-variant/10 shadow-xl bg-[#0d0d1a]">
              <h3 className="font-headline text-xl text-on-surface mb-2">Cash Flow — 6 Months</h3>
              <p className="text-[#F1F0EC]/40 text-xs font-mono mb-6">Income vs Expense trend</p>
              {cashFlow.length > 0 && cashFlow.some(d => d.income > 0 || d.expense > 0) ? (
                <div className="space-y-3">
                  {cashFlow.map((m, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between">
                        <span className="font-mono text-[10px] text-[#F1F0EC]/60 uppercase">{m.month}</span>
                        <span className="font-mono text-[10px] text-[#F1F0EC]/40">₹{m.income.toLocaleString("en-IN")} / ₹{m.expense.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex gap-1 h-2">
                        <div className="bg-green-400/60 rounded-full" style={{ width: `${Math.max(2, (m.income / (Math.max(m.income, m.expense) || 1)) * 100)}%` }} />
                        <div className="bg-red-400/60 rounded-full" style={{ width: `${Math.max(2, (m.expense / (Math.max(m.income, m.expense) || 1)) * 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center">
                  <p className="font-mono text-xs text-[#F1F0EC]/30">Add transactions to see trends</p>
                </div>
              )}
            </div>

            {/* Expense Breakdown */}
            <div className="glass-panel rounded-xl p-8 border border-outline-variant/10 shadow-xl bg-[#0d0d1a]">
              <h3 className="font-headline text-xl text-on-surface mb-2">Expense Breakdown</h3>
              <p className="text-[#F1F0EC]/40 text-xs font-mono mb-6">Category-wise distribution</p>
              {expenseBreakdown.length > 0 ? (
                <div className="space-y-3">
                  {expenseBreakdown.map((cat, i) => (
                    <div key={cat.name} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                      <span className="text-sm text-[#F1F0EC] flex-1 truncate">{cat.name}</span>
                      <span className="font-mono text-xs text-[#F1F0EC]/60">{cat.percentage}%</span>
                      <span className="font-mono text-sm font-bold text-on-surface">₹{(cat.amount || 0).toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center">
                  <p className="font-mono text-xs text-[#F1F0EC]/30">No expense data yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Export Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="border border-outline-variant/20 px-5 py-2.5 rounded-lg text-sm text-on-surface hover:border-[#C9A84C] transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span> Export PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
}
