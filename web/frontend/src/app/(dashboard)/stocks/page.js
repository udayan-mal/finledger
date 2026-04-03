"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function StocksPage() {
  const [trades, setTrades] = useState([]);
  const [holdings, setHoldings] = useState([]);
  const [metrics, setMetrics] = useState({ invested: 0, current: 0, pnl: 0, pnlPercent: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTrades() {
      try {
        const { data } = await api.get("/stock-trades");
        setTrades(data);
        calculateHoldings(data);
      } catch (err) {
        console.error("Failed to fetch stock trades:", err);
        setError("Failed to decrypt secure ledger data.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchTrades();
  }, []);

  const calculateHoldings = (rawTrades) => {
    const map = {};

    // Sort ascending (oldest first) to accurately build Average Cost algorithms
    const sortedTrades = [...rawTrades].sort((a, b) => new Date(a.date) - new Date(b.date));

    sortedTrades.forEach(t => {
      if (!map[t.symbol]) {
        map[t.symbol] = { symbol: t.symbol, qty: 0, avgCost: 0, charges: 0, lastPrice: 0 };
      }
      
      const h = map[t.symbol];

      if (t.tradeType === "BUY") {
        const currentTotalValue = h.qty * h.avgCost;
        const newTradeValue = t.qty * t.pricePaise;
        h.avgCost = (currentTotalValue + newTradeValue) / (h.qty + t.qty);
        h.qty += t.qty;
        h.charges += (t.totalChargesPaise || 0);
        h.lastPrice = t.pricePaise;
      } else if (t.tradeType === "SELL") {
        h.qty -= t.qty;
        if (h.qty < 0) h.qty = 0; // Data safety buffer
        h.charges += (t.totalChargesPaise || 0);
        h.lastPrice = t.pricePaise;
      } else if (t.tradeType === "DIVIDEND") {
        // Dividends don't affect average core cost basis, but affect P&L
        // We'll track it in charges as a negative charge to benefit P&L.
        h.charges -= (t.pricePaise * t.qty); // Simplified
      }
    });

    // Filter out rows where they sold all their stock
    const activeHoldings = Object.values(map).filter(h => h.qty > 0);

    // Calculate aggregated portfolio totals
    let totalInvested = 0;
    let totalCurrent = 0;

    activeHoldings.forEach(h => {
      // Calculate specific holding finances
      h.investedPaise = (h.qty * h.avgCost); 
      h.currentValuePaise = (h.qty * h.lastPrice);
      h.unrealizedPnlPaise = h.currentValuePaise - h.investedPaise;
      h.pnlPercent = h.investedPaise > 0 ? (h.unrealizedPnlPaise / h.investedPaise) * 100 : 0;

      // Add to global totals
      totalInvested += h.investedPaise;
      totalCurrent += h.currentValuePaise;
    });

    setHoldings(activeHoldings.sort((a, b) => b.investedPaise - a.investedPaise));
    
    // Set global metrics
    const overallPnl = totalCurrent - totalInvested;
    const overallPnlPercent = totalInvested > 0 ? (overallPnl / totalInvested) * 100 : 0;
    
    setMetrics({
      invested: totalInvested,
      current: totalCurrent,
      pnl: overallPnl,
      pnlPercent: overallPnlPercent
    });
  };

  // Format amount mathematically
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
          <h2 className="font-headline text-3xl text-on-surface">Stock Market Tracker</h2>
          <p className="text-on-surface-variant/60 text-sm font-mono mt-1 uppercase tracking-widest">
            Algorithmic portfolio tracking derived from real trades
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="glass-panel p-24 flex flex-col items-center justify-center gap-4 rounded-xl shadow-2xl">
          <span className="material-symbols-outlined text-[32px] text-[#C9A84C] animate-spin">refresh</span>
          <p className="font-mono text-xs uppercase tracking-widest text-[#F1F0EC]/60">Aggregating Holdings Engine...</p>
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
              <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-2 relative z-10">Current Value</p>
              <span className="font-mono text-2xl font-bold text-[#C9A84C] relative z-10">{formatCurrency(metrics.current)}</span>
            </div>
            <div className="glass-panel p-6 rounded-xl border border-outline-variant/10 shadow-xl bg-[#0d0d1a] relative overflow-hidden group">
              <div className="absolute inset-0 bg-[#C9A84C]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-2 relative z-10">Unrealized P&L</p>
              <div className="flex items-baseline gap-2 relative z-10">
                <span className={`font-mono text-2xl font-bold ${metrics.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {metrics.pnl > 0 ? "+" : ""}{formatCurrency(metrics.pnl)}
                </span>
                <span className={`material-symbols-outlined text-sm ${metrics.pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {metrics.pnl >= 0 ? "trending_up" : "trending_down"}
                </span>
              </div>
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
                   <span className="material-symbols-outlined text-[32px] text-[#C9A84C]/80">monitoring</span>
                 </div>
                 <p className="font-headline text-lg text-[#C9A84C]">No Active Holdings</p>
                 <p className="font-mono text-[10px] uppercase tracking-widest text-[#F1F0EC]/40 text-center max-w-sm leading-relaxed">
                   Your portfolio algorithm is completely empty. Use the Global <strong className="text-[#C9A84C]">+ Quick Add</strong> button in the Top App Bar to execute a stock trade.
                 </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-[#12121f] border-b border-outline-variant/10">
                      <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-[#C9A84C]/80 font-bold">Symbol</th>
                      <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-[#C9A84C]/80 font-bold text-right">Qty</th>
                      <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-[#C9A84C]/80 font-bold text-right">Avg Cost</th>
                      <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-[#C9A84C]/80 font-bold text-right">Last Price</th>
                      <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-[#C9A84C]/80 font-bold text-right">Invested</th>
                      <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-[#C9A84C]/80 font-bold text-right">Value</th>
                      <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-[#C9A84C]/80 font-bold text-right">P&L</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/5">
                    {holdings.map((h) => (
                      <tr key={h.symbol} className="group hover:bg-[#1a1a28] transition-colors duration-200">
                        <td className="px-6 py-4 font-mono text-sm font-bold text-on-surface whitespace-nowrap">
                          {h.symbol}
                          <p className="text-[9px] text-[#F1F0EC]/30 font-sans tracking-wide mt-0.5">NSE</p>
                        </td>
                        <td className="px-6 py-4 font-mono text-sm text-[#F1F0EC]/80 text-right">{h.qty}</td>
                        <td className="px-6 py-4 font-mono text-sm text-[#F1F0EC]/80 text-right">{formatCurrency(h.avgCost)}</td>
                        <td className="px-6 py-4 font-mono text-sm text-[#C9A84C] text-right">{formatCurrency(h.lastPrice)}</td>
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
