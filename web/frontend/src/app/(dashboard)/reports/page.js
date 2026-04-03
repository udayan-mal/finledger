export default function ReportsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-headline text-3xl text-on-surface">Reports & Analytics</h2>
        <p className="text-on-surface-variant/60 text-sm">Daily, weekly, monthly, quarterly, yearly and custom range analytics</p>
      </div>

      {/* Date Filter Chips */}
      <div className="flex gap-2 flex-wrap">
        {["Daily", "Weekly", "Monthly", "Quarterly", "Yearly", "Custom"].map((period) => (
          <button key={period} className={`px-4 py-2 rounded-lg font-mono text-[10px] uppercase tracking-widest transition-colors ${period === "Monthly" ? "bg-surface-container-highest text-tertiary" : "text-on-surface-variant/40 hover:text-on-surface-variant hover:bg-surface-container-high/50"}`}>
            {period}
          </button>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel rounded-xl p-8 border-t border-tertiary/20">
          <h3 className="font-headline text-xl text-on-surface mb-2">Expense Breakdown</h3>
          <p className="text-on-surface-variant/60 text-xs mb-8">Category-wise donut chart</p>
          <div className="flex items-center justify-center h-48">
            <div className="w-40 h-40 rounded-full border-[10px] border-tertiary/20 relative">
              <div className="absolute inset-0 rounded-full border-[10px] border-tertiary border-b-transparent border-r-transparent rotate-12" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono text-lg font-bold text-on-surface">₹42K</span>
                <span className="font-mono text-[9px] text-on-surface-variant/60">THIS MONTH</span>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-xl p-8 border-t border-tertiary/20">
          <h3 className="font-headline text-xl text-on-surface mb-2">Income vs Expense</h3>
          <p className="text-on-surface-variant/60 text-xs mb-8">Monthly comparison bars</p>
          <div className="flex items-end gap-3 h-48 px-4">
            {[65, 40, 72, 45, 80, 42].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col gap-1">
                <div className={`rounded-t-sm transition-all ${i % 2 === 0 ? "bg-tertiary/40" : "bg-red-400/30"}`} style={{ height: `${h}%` }} />
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-xl p-8 border-t border-tertiary/20">
          <h3 className="font-headline text-xl text-on-surface mb-2">Net Savings Trend</h3>
          <p className="text-on-surface-variant/60 text-xs mb-8">Monthly savings trajectory</p>
          <div className="h-48 flex items-end relative">
            <svg className="w-full h-full" viewBox="0 0 300 120" preserveAspectRatio="none">
              <defs>
                <linearGradient id="savGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e6c364" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#e6c364" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0 100 Q50 80 100 60 T200 40 T300 20 V120 H0Z" fill="url(#savGrad)" />
              <path d="M0 100 Q50 80 100 60 T200 40 T300 20" fill="none" stroke="#e6c364" strokeWidth="2" />
            </svg>
          </div>
        </div>

        <div className="glass-panel rounded-xl p-8 border-t border-tertiary/20">
          <h3 className="font-headline text-xl text-on-surface mb-2">Cash Flow Sankey</h3>
          <p className="text-on-surface-variant/60 text-xs mb-8">Where money comes from and goes</p>
          <div className="h-48 flex items-center justify-center">
            <div className="text-center">
              <span className="material-symbols-outlined text-4xl text-tertiary/40 mb-2">account_tree</span>
              <p className="text-on-surface-variant/40 text-xs font-mono">Connect data to generate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Export */}
      <div className="flex gap-3">
        <button className="border border-outline-variant/30 px-5 py-2.5 rounded-lg text-on-surface text-sm hover:border-tertiary transition-colors flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span> Export PDF
        </button>
        <button className="border border-outline-variant/30 px-5 py-2.5 rounded-lg text-on-surface text-sm hover:border-tertiary transition-colors flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">table_chart</span> Export CSV
        </button>
      </div>
    </div>
  );
}
