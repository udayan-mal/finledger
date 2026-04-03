export default function NetWorthPage() {
  const assets = [
    { label: "Bank Accounts", value: "₹5,42,000", icon: "account_balance" },
    { label: "Cash in Hand", value: "₹18,500", icon: "payments" },
    { label: "Stock Portfolio", value: "₹1,59,950", icon: "monitoring" },
    { label: "Mutual Funds", value: "₹1,57,791", icon: "account_balance" },
    { label: "Fixed Deposits", value: "₹3,00,000", icon: "lock" },
  ];
  const liabilities = [
    { label: "Credit Card Outstanding", value: "₹24,800", icon: "credit_card" },
    { label: "Personal Loan", value: "₹1,50,000", icon: "receipt" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-headline text-3xl text-on-surface">Net Worth</h2>
        <p className="text-on-surface-variant/60 text-sm">Assets minus liabilities with daily snapshot history</p>
      </div>

      {/* Hero Number */}
      <div className="glass-panel rounded-xl p-10 text-center border-t border-tertiary/20">
        <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-3">Total Net Worth</p>
        <p className="font-mono text-5xl font-bold text-tertiary">₹10,03,441</p>
        <div className="flex items-center justify-center gap-2 mt-3">
          <span className="material-symbols-outlined text-green-500 text-sm">trending_up</span>
          <span className="font-mono text-sm text-green-400">+8.4% this month</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Assets */}
        <div className="space-y-4">
          <h3 className="font-headline text-xl text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-green-400 text-[20px]">arrow_upward</span>Assets
          </h3>
          {assets.map((a) => (
            <div key={a.label} className="glass-panel rounded-xl p-5 flex items-center justify-between hover:-translate-y-0.5 transition-transform">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-surface-container flex items-center justify-center rounded-lg border border-outline-variant/20">
                  <span className="material-symbols-outlined text-tertiary text-[18px]">{a.icon}</span>
                </div>
                <span className="text-sm text-on-surface">{a.label}</span>
              </div>
              <span className="font-mono text-sm font-bold text-green-400">{a.value}</span>
            </div>
          ))}
        </div>

        {/* Liabilities */}
        <div className="space-y-4">
          <h3 className="font-headline text-xl text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-red-400 text-[20px]">arrow_downward</span>Liabilities
          </h3>
          {liabilities.map((l) => (
            <div key={l.label} className="glass-panel rounded-xl p-5 flex items-center justify-between hover:-translate-y-0.5 transition-transform">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-surface-container flex items-center justify-center rounded-lg border border-outline-variant/20">
                  <span className="material-symbols-outlined text-red-400 text-[18px]">{l.icon}</span>
                </div>
                <span className="text-sm text-on-surface">{l.label}</span>
              </div>
              <span className="font-mono text-sm font-bold text-red-400">{l.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Trend Chart Placeholder */}
      <div className="glass-panel rounded-xl p-8 border-t border-tertiary/20">
        <h3 className="font-headline text-xl text-on-surface mb-2">Historical Trend</h3>
        <p className="text-on-surface-variant/60 text-xs mb-6">Net worth snapshots captured daily</p>
        <div className="h-48 flex items-end">
          <svg className="w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="none">
            <defs>
              <linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e6c364" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#e6c364" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0 110 Q60 95 120 80 T240 50 T360 30 L400 25 V120 H0Z" fill="url(#nwGrad)" />
            <path d="M0 110 Q60 95 120 80 T240 50 T360 30 L400 25" fill="none" stroke="#e6c364" strokeWidth="2" />
          </svg>
        </div>
      </div>
    </div>
  );
}
