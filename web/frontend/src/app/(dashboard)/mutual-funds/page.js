export default function MutualFundsPage() {
  const funds = [
    { id: "1", name: "Vanguard Bluechip Direct", type: "SIP", icon: "diamond", nav: "₹482.12", units: "124.55", invested: "₹50,000", current: "₹60,043", sipAmt: "₹10,000", sipDate: 12, pnl: "+20.1%", pnlColor: "text-green-400" },
    { id: "2", name: "Aggressive Tech Alpha", type: "SIP", icon: "rocket_launch", nav: "₹1,240.50", units: "24.10", invested: "₹30,000", current: "₹29,896", sipAmt: "₹5,000", sipDate: 5, pnl: "-0.3%", pnlColor: "text-red-400" },
    { id: "3", name: "Secure Sovereign Debt", type: "LUMPSUM", icon: "shield", nav: "₹12.45", units: "5,450", invested: "₹60,000", current: "₹67,852", sipAmt: "—", sipDate: null, pnl: "+13.1%", pnlColor: "text-green-400" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline text-3xl text-on-surface">Mutual Fund Tracker</h2>
          <p className="text-on-surface-variant/60 text-sm">Track SIP and lumpsum investments with NAV sync and XIRR</p>
        </div>
        <button className="gold-sheen px-6 py-2 rounded-md text-on-tertiary font-bold text-sm hover:scale-95 transition-transform">ADD FUND</button>
      </div>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-xl border-t border-tertiary/20">
          <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-2">Total Invested</p>
          <span className="font-mono text-2xl font-bold text-on-surface">₹1,40,000</span>
        </div>
        <div className="glass-panel p-6 rounded-xl border-t border-tertiary/20">
          <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-2">Current NAV Value</p>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-tertiary">₹1,57,791</span>
            <span className="material-symbols-outlined text-green-500 text-sm">trending_up</span>
          </div>
        </div>
        <div className="glass-panel p-6 rounded-xl border-t border-tertiary/20">
          <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-2">Total Units</p>
          <span className="font-mono text-2xl font-bold text-on-surface">5,598.65</span>
        </div>
        <div className="glass-panel p-6 rounded-xl border-t border-tertiary/20">
          <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-2">Portfolio XIRR</p>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-green-400">14.82%</span>
            <span className="font-mono text-[10px] text-green-400/60">+2.4% MoM</span>
          </div>
        </div>
      </section>

      {/* Add Form */}
      <div className="glass-panel rounded-xl p-8">
        <h3 className="font-headline text-xl text-on-surface mb-6">Add Investment</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <input className="bg-surface-container-low border border-outline-variant/20 text-sm py-2.5 px-4 rounded-lg placeholder:text-on-surface-variant/40 text-on-surface outline-none focus:ring-1 focus:ring-tertiary" placeholder="Fund name" />
          <input className="bg-surface-container-low border border-outline-variant/20 text-sm py-2.5 px-4 rounded-lg placeholder:text-on-surface-variant/40 text-on-surface outline-none focus:ring-1 focus:ring-tertiary" placeholder="SIP amount (₹)" type="number" />
          <input className="bg-surface-container-low border border-outline-variant/20 text-sm py-2.5 px-4 rounded-lg placeholder:text-on-surface-variant/40 text-on-surface outline-none focus:ring-1 focus:ring-tertiary" placeholder="SIP date (1-31)" type="number" />
        </div>
        <div className="flex gap-3 mt-6">
          <button className="gold-sheen px-6 py-2.5 rounded-md text-on-tertiary font-bold text-sm hover:scale-95 transition-transform">Add SIP</button>
          <button className="border border-outline-variant/30 px-6 py-2.5 rounded-md text-on-surface text-sm hover:border-tertiary transition-colors">Add Lumpsum</button>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/40">Fund</th>
                <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/40">Type</th>
                <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/40">NAV</th>
                <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/40">Units</th>
                <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/40">Invested</th>
                <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/40">Current</th>
                <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/40">P&L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {funds.map((f) => (
                <tr key={f.id} className="hover:bg-surface-container-highest/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-surface-container flex items-center justify-center rounded-lg border border-outline-variant/20">
                        <span className="material-symbols-outlined text-tertiary text-[18px]">{f.icon}</span>
                      </div>
                      <span className="font-bold text-on-surface text-sm">{f.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-[10px] uppercase text-on-surface-variant">{f.type}</td>
                  <td className="px-6 py-4 font-mono text-sm text-on-surface">{f.nav}</td>
                  <td className="px-6 py-4 font-mono text-sm text-on-surface-variant">{f.units}</td>
                  <td className="px-6 py-4 font-mono text-sm text-on-surface-variant">{f.invested}</td>
                  <td className="px-6 py-4 font-mono text-sm font-bold text-on-surface">{f.current}</td>
                  <td className={`px-6 py-4 font-mono text-sm font-bold ${f.pnlColor}`}>{f.pnl}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
