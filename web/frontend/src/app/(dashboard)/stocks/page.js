export default function StocksPage() {
  const trades = [
    { id: "1", symbol: "TCS", qty: 15, avgPrice: "₹3,840.50", currentPrice: "₹4,120.00", invested: "₹57,607.50", current: "₹61,800.00", pnl: "+7.3%", pnlColor: "text-green-400" },
    { id: "2", symbol: "RELIANCE", qty: 20, avgPrice: "₹2,450.00", currentPrice: "₹2,680.00", invested: "₹49,000.00", current: "₹53,600.00", pnl: "+9.4%", pnlColor: "text-green-400" },
    { id: "3", symbol: "INFY", qty: 30, avgPrice: "₹1,520.00", currentPrice: "₹1,485.00", invested: "₹45,600.00", current: "₹44,550.00", pnl: "-2.3%", pnlColor: "text-red-400" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-headline text-3xl text-on-surface">Stock Market Tracker</h2>
        <p className="text-on-surface-variant/60 text-sm">Buy/sell trades with auto-calculated charges (STT, exchange, SEBI, GST, stamp duty)</p>
      </div>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-xl border-t border-tertiary/20">
          <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-2">Total Invested</p>
          <span className="font-mono text-2xl font-bold text-on-surface">₹1,52,207</span>
        </div>
        <div className="glass-panel p-6 rounded-xl border-t border-tertiary/20">
          <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-2">Current Value</p>
          <span className="font-mono text-2xl font-bold text-tertiary">₹1,59,950</span>
        </div>
        <div className="glass-panel p-6 rounded-xl border-t border-tertiary/20">
          <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-2">Unrealized P&L</p>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-green-400">+₹7,743</span>
            <span className="material-symbols-outlined text-green-500 text-sm">trending_up</span>
          </div>
        </div>
        <div className="glass-panel p-6 rounded-xl border-t border-tertiary/20">
          <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-2">XIRR</p>
          <span className="font-mono text-2xl font-bold text-green-400">18.42%</span>
        </div>
      </section>

      {/* Add Trade Form */}
      <div className="glass-panel rounded-xl p-8">
        <h3 className="font-headline text-xl text-on-surface mb-6">Add New Trade</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <input className="bg-surface-container-low border border-outline-variant/20 text-sm py-2.5 px-4 rounded-lg placeholder:text-on-surface-variant/40 text-on-surface outline-none focus:ring-1 focus:ring-tertiary" placeholder="Symbol (e.g. TCS)" />
          <input className="bg-surface-container-low border border-outline-variant/20 text-sm py-2.5 px-4 rounded-lg placeholder:text-on-surface-variant/40 text-on-surface outline-none focus:ring-1 focus:ring-tertiary" placeholder="Quantity" type="number" />
          <input className="bg-surface-container-low border border-outline-variant/20 text-sm py-2.5 px-4 rounded-lg placeholder:text-on-surface-variant/40 text-on-surface outline-none focus:ring-1 focus:ring-tertiary" placeholder="Price (₹)" type="number" />
          <select className="bg-surface-container-low border border-outline-variant/20 text-sm py-2.5 px-3 rounded-lg text-on-surface outline-none focus:ring-1 focus:ring-tertiary">
            <option>BUY</option>
            <option>SELL</option>
          </select>
        </div>
        <button className="gold-sheen mt-6 px-6 py-2.5 rounded-md text-on-tertiary font-bold text-sm hover:scale-95 transition-transform">Save Trade</button>
      </div>

      {/* Holdings Table */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/40">Symbol</th>
                <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/40">Qty</th>
                <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/40">Avg Price</th>
                <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/40">Current</th>
                <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/40">Invested</th>
                <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/40">Value</th>
                <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/40">P&L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {trades.map((t) => (
                <tr key={t.id} className="hover:bg-surface-container-highest/20 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm font-bold text-on-surface">{t.symbol}</td>
                  <td className="px-6 py-4 font-mono text-sm text-on-surface-variant">{t.qty}</td>
                  <td className="px-6 py-4 font-mono text-sm text-on-surface-variant">{t.avgPrice}</td>
                  <td className="px-6 py-4 font-mono text-sm text-on-surface">{t.currentPrice}</td>
                  <td className="px-6 py-4 font-mono text-sm text-on-surface-variant">{t.invested}</td>
                  <td className="px-6 py-4 font-mono text-sm font-bold text-on-surface">{t.current}</td>
                  <td className={`px-6 py-4 font-mono text-sm font-bold ${t.pnlColor}`}>{t.pnl}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
