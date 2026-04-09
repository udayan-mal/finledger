"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function MutualFundsPage() {
  const [holdings, setHoldings] = useState([]);
  const [metrics, setMetrics] = useState({ invested: 0, current: 0, pnl: 0, pnlPercent: 0, totalUnits: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchFunds() {
      try {
        const { data } = await api.get("/mutual-funds");
        calculateHoldings(data);
      } catch (err) {
        console.error("Failed to fetch mutual funds:", err);
        setError("Failed to decrypt secure ledger data.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchFunds();
  }, []);

  const calculateHoldings = (rawFunds) => {
    const map = {};
    let globalInvested = 0;
    let globalCurrent = 0;
    let globalUnits = 0;

    rawFunds.forEach((f) => {
      if (!map[f.fundName]) {
        map[f.fundName] = {
          name: f.fundName,
          type: f.type, // SIP or LUMPSUM
          totalUnits: 0,
          investedPaise: 0,
          highestKnownNavPaise: 0,
          icon: f.type === "SIP" ? "diamond" : "shield",
        };
      }
      
      const h = map[f.fundName];
      const unitsFloat = parseFloat(f.units) || 0;
      
      h.totalUnits += unitsFloat;
      h.investedPaise += Math.round(unitsFloat * f.navAtBuyPaise);
      
      // Fallback: Using the highest NAV ever traded by user as the "Current NAV" mock.
      if (f.navAtBuyPaise > h.highestKnownNavPaise) {
        h.highestKnownNavPaise = f.navAtBuyPaise;
      }
    });

    const activeHoldings = Object.values(map);

    activeHoldings.forEach(h => {
       h.currentValuePaise = Math.round(h.totalUnits * h.highestKnownNavPaise);
       h.unrealizedPnlPaise = h.currentValuePaise - h.investedPaise;
       h.pnlPercent = h.investedPaise > 0 ? (h.unrealizedPnlPaise / h.investedPaise) * 100 : 0;
       
       globalInvested += h.investedPaise;
       globalCurrent += h.currentValuePaise;
       globalUnits += h.totalUnits;
    });

    setHoldings(activeHoldings);
    
    const overallPnl = globalCurrent - globalInvested;
    const overallPnlPercent = globalInvested > 0 ? (overallPnl / globalInvested) * 100 : 0;

    setMetrics({
      invested: globalInvested,
      current: globalCurrent,
      totalUnits: globalUnits,
      pnl: overallPnl,
      pnlPercent: overallPnlPercent
    });
  };

  const formatCurrency = (paise) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(paise / 100);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline text-3xl text-on-surface">Mutual Fund Tracker</h2>
          <p className="text-on-surface-variant/60 text-sm font-mono mt-1 uppercase tracking-widest">
            Algorithmic fund aggregation with weighted NAV tracking
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="glass-panel p-24 flex flex-col items-center justify-center gap-4 rounded-xl shadow-2xl">
          <span className="material-symbols-outlined text-[32px] text-[#C9A84C] animate-spin">refresh</span>
          <p className="font-mono text-xs uppercase tracking-widest text-[#F1F0EC]/60">Aggregating Mutual Funds Engine...</p>
        </div>
      ) : error ? (
        <div className="glass-panel p-12 flex flex-col items-center justify-center gap-2 text-red-400 rounded-xl">
          <span className="material-symbols-outlined text-[32px]">error</span>
          <p className="font-mono text-xs uppercase tracking-widest">{error}</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="glass-panel p-6 rounded-xl border border-outline-variant/10 shadow-xl bg-[#0d0d1a] relative overflow-hidden group">
              <div className="absolute inset-0 bg-[#C9A84C]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-2 relative z-10">Total Invested</p>
              <span className="font-mono text-2xl font-bold text-on-surface relative z-10">{formatCurrency(metrics.invested)}</span>
            </div>
            <div className="glass-panel p-6 rounded-xl border border-outline-variant/10 shadow-xl bg-[#0d0d1a] relative overflow-hidden group">
              <div className="absolute inset-0 bg-[#C9A84C]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-2 relative z-10">Current Estimated Value</p>
              <div className="flex items-baseline gap-2 relative z-10">
                <span className="font-mono text-2xl font-bold text-[#C9A84C]">{formatCurrency(metrics.current)}</span>
                <span className={`material-symbols-outlined text-sm ${metrics.pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {metrics.pnl >= 0 ? "trending_up" : "trending_down"}
                </span>
              </div>
            </div>
            <div className="glass-panel p-6 rounded-xl border border-outline-variant/10 shadow-xl bg-[#0d0d1a] relative overflow-hidden group">
              <div className="absolute inset-0 bg-[#C9A84C]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-2 relative z-10">Total Units Accumuluation</p>
              <span className="font-mono text-2xl font-bold text-on-surface relative z-10">{metrics.totalUnits.toLocaleString('en-IN', { maximumFractionDigits: 3 })}</span>
            </div>
            <div className="glass-panel p-6 rounded-xl border border-outline-variant/10 shadow-xl bg-[#12121f] relative overflow-hidden">
              <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-2">Portfolio Return</p>
              <span className={`font-mono text-2xl font-bold ${metrics.pnlPercent >= 0 ? "text-green-400" : "text-red-400"}`}>
                 {metrics.pnlPercent > 0 ? "+" : ""}{metrics.pnlPercent.toFixed(2)}%
              </span>
            </div>
          </section>

          {/* Holdings Table */}
          <div className="glass-panel border border-outline-variant/10 rounded-xl overflow-hidden shadow-2xl bg-[#0d0d1a]">
            {holdings.length === 0 ? (
              <div className="py-24 flex flex-col items-center justify-center gap-3">
                 <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-2">
                   <span className="material-symbols-outlined text-[32px] text-[#C9A84C]/80">account_balance</span>
                 </div>
                 <p className="font-headline text-lg text-[#C9A84C]">No Active Mutual Funds</p>
                 <p className="font-mono text-[10px] uppercase tracking-widest text-[#F1F0EC]/40 text-center max-w-sm leading-relaxed">
                   Your portfolio algorithm is cleanly isolated. Use the Global <strong className="text-[#C9A84C]">+ Quick Add</strong> button in the Top App Bar to execute a new SIP or Lumpsum unit injection.
                 </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-[#12121f] border-b border-outline-variant/10">
                      <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-[#C9A84C]/80 font-bold">Fund Asset</th>
                      <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-[#C9A84C]/80 font-bold">Type</th>
                      <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-[#C9A84C]/80 font-bold text-right">Units</th>
                      <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-[#C9A84C]/80 font-bold text-right">Est. NAV</th>
                      <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-[#C9A84C]/80 font-bold text-right">Invested</th>
                      <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-[#C9A84C]/80 font-bold text-right">Current</th>
                      <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-[#C9A84C]/80 font-bold text-right">P&L</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/5">
                    {holdings.map((h) => (
                      <tr key={h.name} className="group hover:bg-[#1a1a28] transition-colors duration-200">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/10 group-hover:border-[#C9A84C]/30 transition-colors">
                              <span className="material-symbols-outlined text-[#C9A84C] text-[16px]">{h.icon}</span>
                            </div>
                            <span className="font-bold text-on-surface text-sm truncate max-w-[200px]">{h.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-[#F1F0EC]/60">{h.type}</td>
                        <td className="px-6 py-4 font-mono text-sm text-[#F1F0EC]/80 text-right">{h.totalUnits.toLocaleString('en-IN', { maximumFractionDigits: 4 })}</td>
                        <td className="px-6 py-4 font-mono text-sm text-[#C9A84C] text-right">{formatCurrency(h.highestKnownNavPaise)}</td>
                        <td className="px-6 py-4 font-mono text-sm text-[#F1F0EC]/60 text-right">{formatCurrency(h.investedPaise)}</td>
                        <td className="px-6 py-4 font-mono text-sm font-bold text-[#F1F0EC] text-right">{formatCurrency(h.currentValuePaise)}</td>
                        <td className={`px-6 py-4 font-mono text-sm font-bold text-right whitespace-nowrap ${h.unrealizedPnlPaise >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {h.unrealizedPnlPaise > 0 ? "+" : ""}{formatCurrency(h.unrealizedPnlPaise)}
                          <p className="text-[10px] opacity-70 mt-0.5">
                            {h.unrealizedPnlPaise > 0 ? "+" : ""}{h.pnlPercent.toFixed(2)}%
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
