"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
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

const fmtShortDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
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
  const [accounts, setAccounts] = useState([]);
  const [showSipForm, setShowSipForm] = useState(false);
  const [sipForm, setSipForm] = useState({
    fundName: "",
    amountRupees: "100",
    frequency: "MONTHLY",
    dueDay: "15",
    accountId: "",
    platform: "Zerodha",
    type: "SIP"
  });
  const [sipActionBusy, setSipActionBusy] = useState(null);

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

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await apiGetCached("/accounts", { ttlMs: 30000 });
      const accountData = res.data?.data || res.data || [];
      setAccounts(Array.isArray(accountData) ? accountData : []);
    } catch {
      setAccounts([]);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    fetchAccounts();
  }, [fetchDashboard, fetchAccounts]);

  const sipReminders = data?.sipReminders || [];
  const dueSipReminders = sipReminders.filter((item) => item.isDueToday || item.isOverdue);
  const missedSipReminders = sipReminders.filter((item) => item.isOverdue);
  const monthlyContributionTrend = data?.monthlyContributionTrend || [];

  const handleSipFormSubmit = async (event) => {
    event.preventDefault();
    try {
      await api.post("/sip-plans", {
        fundName: sipForm.fundName,
        amountPaise: Math.round(parseFloat(sipForm.amountRupees) * 100),
        frequency: sipForm.frequency,
        dueDay: parseInt(sipForm.dueDay, 10),
        accountId: sipForm.accountId || null,
        platform: sipForm.platform,
        type: sipForm.type
      });
      setShowSipForm(false);
      setSipForm((current) => ({ ...current, fundName: "", amountRupees: "100" }));
      await fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create SIP plan.");
    }
  };

  const runSipAction = async (planId, action, body = {}) => {
    try {
      setSipActionBusy(`${planId}:${action}`);
      await api.post(`/sip-plans/${planId}/${action}`, body);
      await fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.error || `Failed to ${action} SIP.`);
    } finally {
      setSipActionBusy(null);
    }
  };

  // Extract metrics (fallback to zeros)
  const m = data?.metrics || {};
  const cashFlow = data?.cashFlow || [];
  const expenseBreakdown = data?.expenseBreakdown || [];
  const incomeBreakdown = data?.incomeBreakdown || [];
  const sipDueCount = data?.sipDueCount || 0;
  const sipOverdueCount = data?.sipOverdueCount || 0;
  const sipUpcomingCount = data?.sipUpcomingCount || 0;
  const cashRequiredThisMonthPaise = data?.cashRequiredThisMonthPaise || 0;
  const peakContribution = Math.max(0, ...monthlyContributionTrend.map((item) => item.amountPaise || 0));

  const totalMonthlyExpense = expenseBreakdown.reduce((s, e) => s + (e.amount || 0), 0);
  const totalMonthlyIncome = incomeBreakdown.reduce((s, e) => s + (e.amount || 0), 0);

  return (
    <div className="space-y-10">

      {/* ── Page Title ── */}
      <div>
        <h1 className="font-headline text-3xl text-on-surface">Dashboard</h1>
        <p className="text-on-surface-variant/60 text-sm mt-1">Your complete financial overview at a glance</p>
      </div>

      <section className="glass-panel rounded-xl p-5 lg:p-6 border border-white/5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-[#C9A84C] text-[18px]">schedule</span>
              <h2 className="font-headline text-xl text-on-surface">Scheduled SIP</h2>
            </div>
            <p className="text-on-surface-variant/50 text-sm font-mono">
              Create once. Get a monthly one-tap confirmation banner for due funds.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowSipForm((value) => !value)}
            className="px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-widest bg-[#C9A84C] text-[#0d0d1a] font-bold hover:bg-[#d4b55b] transition-colors"
          >
            {showSipForm ? "Close Plan Form" : "Create SIP Plan"}
          </button>
        </div>

        {dueSipReminders.length > 0 && (
          <div className="mt-5 grid grid-cols-1 gap-3">
            {dueSipReminders.map((plan) => (
              <div key={plan.id} className="rounded-xl border border-[#C9A84C]/20 bg-[#12121f] p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-bold text-on-surface">{plan.fundName}</span>
                    <span className={`font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-sm border ${plan.isOverdue ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"}`}>
                      {plan.isOverdue ? "Overdue" : "Due Today"}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant/60 font-mono uppercase tracking-widest">
                    {fmtINR(plan.amountPaise)} • {plan.frequency} • {plan.platform} • Next due {fmtShortDate(plan.nextDue)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={sipActionBusy === `${plan.id}:mark-paid`}
                    onClick={() => runSipAction(plan.id, "mark-paid")}
                    className="px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-widest bg-green-500/15 text-green-300 border border-green-500/20 hover:bg-green-500/25 transition-colors disabled:opacity-50"
                  >
                    Mark Paid
                  </button>
                  <button
                    type="button"
                    disabled={sipActionBusy === `${plan.id}:skip`}
                    onClick={() => runSipAction(plan.id, "skip", { note: "Skipped from dashboard" })}
                    className="px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-widest bg-red-500/10 text-red-300 border border-red-500/20 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                  >
                    Skip
                  </button>
                  <button
                    type="button"
                    disabled={sipActionBusy === `${plan.id}:snooze`}
                    onClick={() => runSipAction(plan.id, "snooze", { snoozeDays: 3, note: "Snoozed from dashboard" })}
                    className="px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-widest bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/20 hover:bg-[#C9A84C]/20 transition-colors disabled:opacity-50"
                  >
                    Snooze 3d
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showSipForm && (
          <form onSubmit={handleSipFormSubmit} className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-[#F1F0EC]/60 mb-2">Fund Name</label>
              <input
                className="w-full bg-[#12121f] border border-outline-variant/20 focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/50 text-sm py-3 px-4 rounded-lg text-on-surface outline-none"
                value={sipForm.fundName}
                onChange={(e) => setSipForm((current) => ({ ...current, fundName: e.target.value }))}
                placeholder="Invesco India Midcap Fund"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-[#F1F0EC]/60 mb-2">Amount (₹)</label>
              <input
                type="number"
                min="1"
                className="w-full bg-[#12121f] border border-outline-variant/20 focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/50 text-sm py-3 px-4 rounded-lg text-on-surface outline-none"
                value={sipForm.amountRupees}
                onChange={(e) => setSipForm((current) => ({ ...current, amountRupees: e.target.value }))}
                placeholder="100"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-[#F1F0EC]/60 mb-2">Day of Month</label>
              <select
                className="w-full bg-[#12121f] border border-outline-variant/20 focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/50 text-sm py-3 px-4 rounded-lg text-on-surface outline-none"
                value={sipForm.dueDay}
                onChange={(e) => setSipForm((current) => ({ ...current, dueDay: e.target.value }))}
              >
                {Array.from({ length: 28 }, (_, index) => index + 1).map((day) => (
                  <option key={day} value={String(day)}>
                    {day}{day === 1 ? "st" : day === 2 ? "nd" : day === 3 ? "rd" : "th"}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-[#F1F0EC]/60 mb-2">Frequency</label>
              <select
                className="w-full bg-[#12121f] border border-outline-variant/20 focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/50 text-sm py-3 px-4 rounded-lg text-on-surface outline-none"
                value={sipForm.frequency}
                onChange={(e) => setSipForm((current) => ({ ...current, frequency: e.target.value }))}
              >
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-[#F1F0EC]/60 mb-2">Account</label>
              <select
                className="w-full bg-[#12121f] border border-outline-variant/20 focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/50 text-sm py-3 px-4 rounded-lg text-on-surface outline-none"
                value={sipForm.accountId}
                onChange={(e) => setSipForm((current) => ({ ...current, accountId: e.target.value }))}
              >
                <option value="">Use default account</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>{account.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-[#F1F0EC]/60 mb-2">Platform</label>
              <select
                className="w-full bg-[#12121f] border border-outline-variant/20 focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/50 text-sm py-3 px-4 rounded-lg text-on-surface outline-none"
                value={sipForm.platform}
                onChange={(e) => setSipForm((current) => ({ ...current, platform: e.target.value }))}
              >
                <option value="Zerodha">Zerodha</option>
                <option value="Groww">Groww</option>
                <option value="Dhan">Dhan</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-[#F1F0EC]/60 mb-2">Type</label>
              <select
                className="w-full bg-[#12121f] border border-outline-variant/20 focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/50 text-sm py-3 px-4 rounded-lg text-on-surface outline-none"
                value={sipForm.type}
                onChange={(e) => setSipForm((current) => ({ ...current, type: e.target.value }))}
              >
                <option value="SIP">SIP</option>
                <option value="LUMPSUM">Lumpsum</option>
              </select>
            </div>
            <div className="md:col-span-2 xl:col-span-3 flex justify-end">
              <button
                type="submit"
                className="px-5 py-3 rounded-lg font-mono text-xs uppercase tracking-widest bg-[#C9A84C] text-[#0d0d1a] font-bold hover:bg-[#d4b55b] transition-colors"
              >
                Save SIP Plan
              </button>
            </div>
          </form>
        )}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <DashMetric
          label="SIP Due / Overdue"
          value={`${sipDueCount}`}
          subtitle={`${sipOverdueCount} overdue`}
          icon="notifications_active"
          valueColor={sipDueCount > 0 ? "text-yellow-300" : "text-green-400"}
          iconColor={sipDueCount > 0 ? "text-yellow-300" : "text-green-400"}
          gradient="bg-yellow-500/10"
        />
        <DashMetric
          label="Upcoming SIP (7d)"
          value={`${sipUpcomingCount}`}
          subtitle="Due in next 7 days"
          icon="event_upcoming"
          valueColor="text-blue-300"
          iconColor="text-blue-300"
          gradient="bg-blue-500/10"
        />
        <DashMetric
          label="Cash Required (Month)"
          value={fmtINR(cashRequiredThisMonthPaise)}
          subtitle="All active SIP plans"
          icon="account_balance_wallet"
          valueColor="text-[#C9A84C]"
          iconColor="text-[#C9A84C]"
          gradient="bg-[#C9A84C]/10"
        />
        <DashMetric
          label="Realized P&L"
          value={fmtINR(m.realizedPnlPaise || 0)}
          subtitle="Sell trades only"
          icon="monitoring"
          valueColor={(m.realizedPnlPaise || 0) >= 0 ? "text-green-400" : "text-red-400"}
          iconColor={(m.realizedPnlPaise || 0) >= 0 ? "text-green-400" : "text-red-400"}
          gradient={(m.realizedPnlPaise || 0) >= 0 ? "bg-green-500/10" : "bg-red-500/10"}
        />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="glass-panel rounded-xl p-6 lg:p-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-red-400 text-[20px]">event_busy</span>
              <h2 className="font-headline text-xl text-on-surface">Missed SIPs</h2>
            </div>
            <p className="text-on-surface-variant/50 text-xs font-mono uppercase tracking-widest">Needs attention</p>
          </div>

          {missedSipReminders.length > 0 ? (
            <div className="space-y-3 max-h-[320px] overflow-y-auto no-scrollbar pr-1">
              {missedSipReminders.map((plan) => (
                <div key={plan.id} className="rounded-xl border border-red-500/15 bg-[#12121f] p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-bold text-on-surface">{plan.fundName}</span>
                      <span className="font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-sm border bg-red-500/10 text-red-300 border-red-500/20">
                        Missed
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant/60 font-mono uppercase tracking-widest">
                      {fmtINR(plan.amountPaise)} • {plan.frequency} • {plan.platform} • Due {fmtShortDate(plan.nextDue)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={sipActionBusy === `${plan.id}:mark-paid`}
                      onClick={() => runSipAction(plan.id, "mark-paid")}
                      className="px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-widest bg-green-500/15 text-green-300 border border-green-500/20 hover:bg-green-500/25 transition-colors disabled:opacity-50"
                    >
                      Pay Now
                    </button>
                    <button
                      type="button"
                      disabled={sipActionBusy === `${plan.id}:skip`}
                      onClick={() => runSipAction(plan.id, "skip", { note: "Skipped from missed SIP panel" })}
                      className="px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-widest bg-red-500/10 text-red-300 border border-red-500/20 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                    >
                      Skip
                    </button>
                    <button
                      type="button"
                      disabled={sipActionBusy === `${plan.id}:snooze`}
                      onClick={() => runSipAction(plan.id, "snooze", { snoozeDays: 3, note: "Snoozed from missed SIP panel" })}
                      className="px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-widest bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/20 hover:bg-[#C9A84C]/20 transition-colors disabled:opacity-50"
                    >
                      Snooze 3d
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-white/5 bg-[#12121f] p-8 text-center">
              <p className="font-headline text-lg text-green-300">No missed SIPs</p>
              <p className="mt-2 text-xs font-mono uppercase tracking-widest text-on-surface-variant/50">All active plans are up to date</p>
            </div>
          )}
        </div>

        <div className="glass-panel rounded-xl p-6 lg:p-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#C9A84C] text-[20px]">balance</span>
              <h2 className="font-headline text-xl text-on-surface">Realized vs Unrealized P&L</h2>
            </div>
            <p className="text-on-surface-variant/50 text-xs font-mono uppercase tracking-widest">Portfolio snapshot</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div className="rounded-xl border border-white/5 bg-[#12121f] p-5">
              <p className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant/50 mb-2">Realized P&L</p>
              <p className={`font-mono text-3xl font-bold ${(m.realizedPnlPaise || 0) >= 0 ? "text-green-400" : "text-red-400"}`}>
                {fmtINR(m.realizedPnlPaise || 0)}
              </p>
              <p className="mt-2 text-xs text-on-surface-variant/50 font-mono">From completed sell trades</p>
            </div>
            <div className="rounded-xl border border-white/5 bg-[#12121f] p-5">
              <p className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant/50 mb-2">Unrealized P&L</p>
              <p className="font-mono text-3xl font-bold text-blue-300">
                {fmtINR(m.unrealizedPnlPaise || 0)}
              </p>
              <p className="mt-2 text-xs text-on-surface-variant/50 font-mono">Live pricing integration pending</p>
            </div>
          </div>

          <div className="h-3 rounded-full overflow-hidden bg-[#12121f] border border-white/5 flex">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
              style={{ width: `${(m.realizedPnlPaise || 0) > 0 ? 100 : 55}%` }}
            />
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
              style={{ width: `${(m.unrealizedPnlPaise || 0) >= 0 ? 45 : 55}%` }}
            />
          </div>

          <div className="flex items-center justify-between mt-3 text-[10px] font-mono uppercase tracking-widest text-on-surface-variant/50">
            <span>Realized</span>
            <span>Unrealized</span>
          </div>
        </div>
      </section>

      <section className="glass-panel rounded-xl p-6 lg:p-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#C9A84C] text-[20px]">insights</span>
            <h2 className="font-headline text-xl text-on-surface">Monthly Contribution Trend</h2>
          </div>
          <p className="text-on-surface-variant/50 text-xs font-mono uppercase tracking-widest">Last 6 months</p>
        </div>

        <div className="grid grid-cols-6 gap-3 items-end min-h-[120px]">
          {monthlyContributionTrend.map((item) => {
            const ratio = peakContribution > 0 ? item.amountPaise / peakContribution : 0;
            const barHeight = Math.max(8, Math.round(ratio * 80));

            return (
              <div key={item.month} className="flex flex-col items-center gap-2">
                <div className="text-[10px] font-mono text-on-surface-variant/60">{item.amountPaise > 0 ? fmtINR(item.amountPaise) : "-"}</div>
                <div className="w-full max-w-[56px] h-[90px] rounded-lg bg-[#12121f] border border-outline-variant/10 flex items-end justify-center p-1">
                  <div
                    className="w-full rounded-md bg-gradient-to-t from-[#C9A84C]/80 to-[#e6c364]"
                    style={{ height: `${barHeight}px` }}
                  />
                </div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant/60">{item.month}</div>
              </div>
            );
          })}
        </div>
      </section>

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
