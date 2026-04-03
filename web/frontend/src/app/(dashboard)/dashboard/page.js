"use client";

import MetricCard from "@/components/ui/MetricCard";
import ExpenseAreaChart from "@/components/charts/ExpenseAreaChart";

/* ── Demo data (shown when backend is unavailable) ── */
const demo = {
  metrics: {
    netWorthPaise: 15824000,
    monthlyIncomePaise: 8500000,
    monthlyExpensePaise: 4200000,
    portfolioValuePaise: 12450000,
    bankCashPaise: 3374000,
    savingsRatePercent: "50.6",
    portfolioPnlPercent: "14.8"
  },
  cashFlow: [
    { month: "Jul", income: 72000, expense: 38000 },
    { month: "Aug", income: 75000, expense: 42000 },
    { month: "Sep", income: 71000, expense: 35000 },
    { month: "Oct", income: 80000, expense: 39000 },
    { month: "Nov", income: 78000, expense: 45000 },
    { month: "Dec", income: 85000, expense: 42000 }
  ],
  expenseBreakdown: [
    { name: "Large Cap Equity", percentage: 42 },
    { name: "Mid Cap Aggressive", percentage: 26 },
    { name: "Dynamic Debt", percentage: 32 }
  ],
  holdings: [
    {
      id: "1",
      name: "Vanguard Bluechip Direct",
      plan: "Growth Plan • Equity",
      planColor: "text-green-400",
      icon: "diamond",
      nav: "₹482.12",
      units: "124.55 Units",
      value: "₹60,043.20",
      pnl: "+12.4%",
      pnlColor: "text-green-400",
      sipType: "Monthly",
      sipDate: "OCT 12"
    },
    {
      id: "2",
      name: "Aggressive Tech Alpha Fund",
      plan: "Direct • High Risk",
      planColor: "text-red-400",
      icon: "rocket_launch",
      nav: "₹1,240.50",
      units: "24.10 Units",
      value: "₹29,896.05",
      pnl: "-1.8%",
      pnlColor: "text-red-400",
      sipType: "Weekly",
      sipDate: "OCT 04"
    },
    {
      id: "3",
      name: "Secure Sovereign Debt",
      plan: "Regular • Low Risk",
      planColor: "text-blue-400",
      icon: "shield",
      nav: "₹12.45",
      units: "5,450.00 Units",
      value: "₹67,852.50",
      pnl: "+6.2%",
      pnlColor: "text-green-400",
      sipType: "Paused",
      sipDate: "-- --",
      paused: true
    }
  ]
};

const fmt = (paise) => (paise / 100).toFixed(2);

export default function DashboardPage() {
  const { metrics, cashFlow, expenseBreakdown, holdings } = demo;

  return (
    <div className="space-y-12">
      {/* ── Summary Bento Grid ── */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <MetricCard
          label="Total Invested"
          value={parseFloat(fmt(metrics.netWorthPaise))}
          suffix="currency"
        />
        <MetricCard
          label="Current NAV Value"
          value={parseFloat(fmt(metrics.portfolioValuePaise))}
          suffix="currency"
          accentValue
          trend={parseFloat(metrics.portfolioPnlPercent)}
        />
        <MetricCard
          label="Unit Balance"
          value="12,450.82"
          suffix=""
        />
        <MetricCard
          label="XIRR Portfolio"
          value="14.82"
          suffix="%"
          trend={2.4}
        />
      </section>

      {/* ── Visual Analytics: Asymmetric Layout ── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Growth Chart */}
        <div className="lg:col-span-2 glass-panel rounded-xl p-8 relative overflow-hidden">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="font-headline text-2xl text-on-surface">
                Wealth Accumulation
              </h2>
              <p className="text-on-surface-variant/60 text-sm">
                SIP performance vs Market Benchmark
              </p>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-surface-container-highest rounded-md text-[10px] font-mono text-tertiary cursor-pointer">
                1Y
              </span>
              <span className="px-3 py-1 text-[10px] font-mono text-on-surface-variant/40 cursor-pointer hover:text-on-surface-variant">
                5Y
              </span>
              <span className="px-3 py-1 text-[10px] font-mono text-on-surface-variant/40 cursor-pointer hover:text-on-surface-variant">
                MAX
              </span>
            </div>
          </div>
          <div className="h-80">
            <ExpenseAreaChart data={cashFlow} />
          </div>
        </div>

        {/* Asset Allocation Pie */}
        <div className="glass-panel rounded-xl p-8 flex flex-col">
          <h2 className="font-headline text-2xl mb-1 text-on-surface">
            Asset Allocation
          </h2>
          <p className="text-on-surface-variant/60 text-sm mb-12">
            Fund distribution by category
          </p>
          <div className="flex-grow flex items-center justify-center relative">
            <div className="w-48 h-48 rounded-full border-[12px] border-tertiary/20 relative">
              <div className="absolute inset-0 rounded-full border-[12px] border-tertiary border-t-transparent border-l-transparent rotate-45" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-mono text-xl font-bold text-on-surface">
                  Equity
                </span>
                <span className="font-mono text-[10px] text-tertiary">
                  68.4%
                </span>
              </div>
            </div>
          </div>
          <div className="mt-8 space-y-3">
            {expenseBreakdown.map((item) => (
              <div
                key={item.name}
                className="flex justify-between items-center"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      item.percentage > 35
                        ? "bg-tertiary"
                        : item.percentage > 28
                          ? "bg-tertiary/60"
                          : "bg-tertiary/20"
                    }`}
                  />
                  <span className="text-xs text-on-surface">{item.name}</span>
                </div>
                <span className="font-mono text-xs text-on-surface-variant">
                  {item.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Active Portfolio Holdings ── */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="font-headline text-3xl text-on-surface">
              Active Portfolio Holdings
            </h2>
            <p className="text-on-surface-variant/60 text-sm">
              Managing {holdings.length} automated wealth streams
            </p>
          </div>
          <button className="gold-sheen px-6 py-2 rounded-md text-on-tertiary font-bold text-sm hover:scale-95 transition-transform duration-200">
            ADD NEW FUND
          </button>
        </div>

        <div className="glass-panel rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-surface-container-low/50">
                  <th className="px-8 py-6 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/40">
                    Fund Name
                  </th>
                  <th className="px-8 py-6 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/40">
                    NAV / Units
                  </th>
                  <th className="px-8 py-6 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/40">
                    Current Value
                  </th>
                  <th className="px-8 py-6 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/40">
                    SIP Schedule
                  </th>
                  <th className="px-8 py-6 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/40">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {holdings.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-surface-container-highest/20 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-surface-container flex items-center justify-center rounded-lg border border-outline-variant/20">
                          <span className="material-symbols-outlined text-tertiary">
                            {row.icon}
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-on-surface">
                            {row.name}
                          </p>
                          <p
                            className={`text-[10px] font-mono ${row.planColor}`}
                          >
                            {row.plan}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-mono text-sm text-on-surface">
                        {row.nav}
                      </p>
                      <p className="font-mono text-[10px] text-on-surface-variant/60">
                        {row.units}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-mono text-sm font-bold text-on-surface">
                        {row.value}
                      </p>
                      <p
                        className={`font-mono text-[10px] ${row.pnlColor}`}
                      >
                        {row.pnl}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`bg-surface-container px-3 py-1 rounded border border-outline-variant/10 ${row.paused ? "opacity-50" : ""}`}
                        >
                          <p className={`text-[9px] font-mono text-on-surface-variant/60 uppercase ${row.paused ? "italic" : ""}`}>
                            {row.sipType}
                          </p>
                          <p className="text-xs font-mono text-on-surface">
                            {row.sipDate}
                          </p>
                        </div>
                        <span className="material-symbols-outlined text-on-surface-variant/40 cursor-pointer hover:text-tertiary transition-colors">
                          {row.paused ? "play_circle" : "calendar_month"}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <button className="material-symbols-outlined text-on-surface-variant/40 hover:text-white transition-colors">
                        more_vert
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
