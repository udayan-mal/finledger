"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import EditEntryModal from "@/components/ui/EditEntryModal";

export default function StocksPage() {
  const [trades, setTrades] = useState([]);
  const [metrics, setMetrics] = useState({ invested: 0, current: 0, pnl: 0, pnlPercent: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editingTrade, setEditingTrade] = useState(null);

  const fetchTrades = useCallback(async () => {
    try {
      const res = await api.get("/stock-trades");
      const tradeData = res.data?.data || res.data || [];
      calculateMetrics(Array.isArray(tradeData) ? tradeData : []);
    } catch (err) {
      console.error("Failed to fetch stock trades:", err);
      setError("Failed to decrypt secure ledger data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this stock trade? Associated transactions will also be purged.")) return;
    try {
      await api.delete(`/stock-trades/${id}`);
      fetchTrades();
    } catch (err) {
      alert("Failed to delete stock trade.");
    }
  };

  const calculateMetrics = (rawTrades) => {
    let totalRealizedPnl = 0;
    let totalCharges = 0;
    let winningTrades = 0;
    let losingTrades = 0;

    const sortedTrades = [...rawTrades].sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedTrades.forEach(t => {
      const pnl = t.netPnlPaise || 0;
      const chg = t.totalChargesPaise || 0;

      totalCharges += chg;
      
      if (t.tradeType === "SELL") {
        totalRealizedPnl += pnl;
        if (pnl > 0) winningTrades++;
        if (pnl < 0) losingTrades++;
      }
    });

    const totalCompleted = winningTrades + losingTrades;
    const winRate = totalCompleted > 0 ? (winningTrades / totalCompleted) * 100 : 0;
    
    setMetrics({
      pnl: totalRealizedPnl,
      charges: totalCharges,
      winRate: winRate,
      totalCompleted
    });
    
    setTrades(sortedTrades);
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
          <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="glass-panel p-6 rounded-xl border border-outline-variant/10 shadow-xl bg-[#0d0d1a] relative overflow-hidden group">
              <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-2 relative z-10">Total Trades Processed</p>
              <span className="font-mono text-3xl font-bold text-on-surface relative z-10">{metrics.totalCompleted}</span>
            </div>
            
            <div className="glass-panel p-6 rounded-xl border border-outline-variant/10 shadow-xl bg-[#0d0d1a] relative overflow-hidden group">
              <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-2 relative z-10">Win Rate</p>
              <span className={`font-mono text-3xl font-bold relative z-10 ${metrics.winRate > 50 ? 'text-green-400' : 'text-[#C9A84C]'}`}>{metrics.winRate.toFixed(1)}%</span>
            </div>

            <div className="glass-panel p-6 rounded-xl border border-outline-variant/10 shadow-xl bg-[#0d0d1a] relative overflow-hidden group">
              <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-2 relative z-10">Total Net P&L</p>
              <span className={`font-mono text-3xl font-bold relative z-10 ${metrics.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                {metrics.pnl > 0 ? "+" : ""}{formatCurrency(metrics.pnl)}
              </span>
            </div>

            <div className="glass-panel p-6 rounded-xl border border-outline-variant/10 shadow-xl bg-[#12121f] relative overflow-hidden">
              <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-2">Total Charges Paid</p>
              <span className="font-mono text-3xl font-bold text-red-500">
                 -{formatCurrency(metrics.charges)}
              </span>
            </div>
          </section>

          {/* Trades Ledger */}
          <div className="glass-panel border border-outline-variant/10 rounded-xl overflow-hidden shadow-2xl bg-[#0d0d1a]">
            {trades.length === 0 ? (
              <div className="py-24 flex flex-col items-center justify-center gap-3">
                 <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-2">
                   <span className="material-symbols-outlined text-[32px] text-[#C9A84C]/80">library_books</span>
                 </div>
                 <p className="font-headline text-lg text-[#C9A84C]">Journal Empty</p>
                 <p className="font-mono text-[10px] uppercase tracking-widest text-[#F1F0EC]/40 text-center max-w-sm leading-relaxed">
                   Enter your first stock trade outcome hitting the <strong className="text-[#C9A84C]">+ Quick Add</strong> button in the top bar.
                 </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-[#12121f] border-b border-outline-variant/10">
                      <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-[#C9A84C]/80 font-bold">Date</th>
                      <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-[#C9A84C]/80 font-bold">Symbol</th>
                      <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-[#C9A84C]/80 font-bold">Type</th>
                      <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-[#C9A84C]/80 font-bold">Platform</th>
                      <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-[#C9A84C]/80 font-bold text-right">Charges Paid</th>
                      <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-[#C9A84C]/80 font-bold text-right">Net P&L</th>
                      <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-[#C9A84C]/80 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/5">
                    {trades.map((t) => (
                      <tr key={t.id} className="group hover:bg-[#1a1a28] transition-colors duration-200">
                        <td className="px-6 py-4 font-mono text-xs text-[#F1F0EC]/60 whitespace-nowrap">
                          {new Date(t.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-6 py-4 font-mono text-sm font-bold text-on-surface whitespace-nowrap">
                          {t.symbol}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-mono text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm border ${
                            t.tradeType === 'BUY' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                          }`}>
                            {t.tradeType}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-[#F1F0EC]/80 uppercase tracking-widest">
                          {t.platform || "N/A"}
                        </td>
                        <td className="px-6 py-4 font-mono text-sm text-red-400/80 text-right">
                          {t.totalChargesPaise > 0 ? `-${formatCurrency(t.totalChargesPaise)}` : "—"}
                        </td>
                        <td className={`px-6 py-4 font-mono text-sm font-bold text-right whitespace-nowrap ${t.netPnlPaise > 0 ? 'text-green-400' : t.netPnlPaise < 0 ? 'text-red-400' : 'text-on-surface-variant/50'}`}>
                          {t.tradeType === "SELL" ? (
                            <>{t.netPnlPaise > 0 ? "+" : ""}{formatCurrency(t.netPnlPaise)}</>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => setEditingTrade(t)} className="text-on-surface-variant/50 hover:text-[#C9A84C] transition-colors" title="Edit">
                                 <span className="material-symbols-outlined text-[18px]">edit</span>
                              </button>
                              <button onClick={() => handleDelete(t.id)} className="text-on-surface-variant/50 hover:text-red-400 transition-colors" title="Delete">
                                 <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                           </div>
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

      <EditEntryModal 
        isOpen={!!editingTrade} 
        onClose={() => setEditingTrade(null)} 
        onSuccess={() => { setEditingTrade(null); fetchTrades(); }}
        entryType="STOCK"
        entryData={editingTrade}
      />
    </div>
  );
}
