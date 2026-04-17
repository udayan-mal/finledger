"use client";

import { useState, useEffect, useCallback } from "react";
import { api, apiGetCached } from "@/lib/api";
import EditEntryModal from "@/components/ui/EditEntryModal";

export default function MutualFundsPage() {
  const [funds, setFunds] = useState([]);
  const [metrics, setMetrics] = useState({ totalInvested: 0, sipTotal: 0, lumpsumTotal: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [editingFund, setEditingFund] = useState(null);

  const fetchFunds = useCallback(async (force = false) => {
    try {
      const res = await apiGetCached("/mutual-funds", { force, ttlMs: 30000 });
      const fundData = res.data?.data || res.data || [];
      const finalData = Array.isArray(fundData) ? fundData : [];
      setFunds(finalData);
      calculateMetrics(finalData);
    } catch (err) {
      console.error("Failed to fetch mutual funds:", err);
      setError("Failed to decrypt secure ledger data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFunds();
  }, [fetchFunds]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this mutual fund entry? Associated transactions will also be purged.")) return;
    try {
      await api.delete(`/mutual-funds/${id}`);
      fetchFunds(true);
    } catch (err) {
      alert("Failed to delete mutual fund.");
    }
  };

  const calculateMetrics = (rawFunds) => {
    let globalInvested = 0;
    let sipTotal = 0;
    let lumpsumTotal = 0;

    rawFunds.forEach((f) => {
      const amt = f.sipAmountPaise || 0;
      globalInvested += amt;
      if (f.type === "SIP") sipTotal += amt;
      if (f.type === "LUMPSUM") lumpsumTotal += amt;
    });

    setMetrics({ totalInvested: globalInvested, sipTotal, lumpsumTotal });
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
          <h2 className="font-headline text-3xl text-on-surface">Mutual Fund Journal</h2>
          <p className="text-on-surface-variant/60 text-sm font-mono mt-1 uppercase tracking-widest">
            Investment flow tracking & execution log
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
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-xl border border-outline-variant/10 shadow-xl bg-[#0d0d1a] relative overflow-hidden group">
              <div className="absolute inset-0 bg-[#C9A84C]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-2 relative z-10">Total Invested</p>
              <span className="font-mono text-3xl font-bold text-on-surface relative z-10">{formatCurrency(metrics.totalInvested)}</span>
            </div>
            <div className="glass-panel p-6 rounded-xl border border-outline-variant/10 shadow-xl bg-[#0d0d1a] relative overflow-hidden group">
              <div className="absolute inset-0 bg-[#C9A84C]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-2 relative z-10">Total SIP Executions</p>
              <div className="flex items-baseline gap-2 relative z-10">
                <span className="font-mono text-2xl font-bold text-[#C9A84C]">{formatCurrency(metrics.sipTotal)}</span>
              </div>
            </div>
            <div className="glass-panel p-6 rounded-xl border border-outline-variant/10 shadow-xl bg-[#0d0d1a] relative overflow-hidden group">
              <div className="absolute inset-0 bg-[#C9A84C]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-2 relative z-10">Total Lumpsum Flow</p>
              <span className="font-mono text-2xl font-bold text-[#C9A84C] relative z-10">{formatCurrency(metrics.lumpsumTotal)}</span>
            </div>
          </section>

          {/* Holdings Table */}
          <div className="glass-panel border border-outline-variant/10 rounded-xl overflow-hidden shadow-2xl bg-[#0d0d1a]">
            {funds.length === 0 ? (
              <div className="py-24 flex flex-col items-center justify-center gap-3">
                 <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-2">
                   <span className="material-symbols-outlined text-[32px] text-[#C9A84C]/80">account_balance</span>
                 </div>
                 <p className="font-headline text-lg text-[#C9A84C]">No Fund Executions</p>
                 <p className="font-mono text-[10px] uppercase tracking-widest text-[#F1F0EC]/40 text-center max-w-sm leading-relaxed">
                   Your portfolio algorithm is completely empty. Use the Global <strong className="text-[#C9A84C]">+ Quick Add</strong> button in the Top App Bar to execute an investment.
                 </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-[#12121f] border-b border-outline-variant/10">
                      <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-[#C9A84C]/80 font-bold">Date</th>
                      <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-[#C9A84C]/80 font-bold">Fund Name</th>
                      <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-[#C9A84C]/80 font-bold">Type</th>
                      <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-[#C9A84C]/80 font-bold">Platform</th>
                      <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-[#C9A84C]/80 font-bold text-right">Amount Invested</th>
                      <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-[#C9A84C]/80 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/5">
                    {funds.map((f) => (
                      <tr key={f.id} className="group hover:bg-[#1a1a28] transition-colors duration-200">
                        <td className="px-6 py-4 font-mono text-xs text-[#F1F0EC]/60 whitespace-nowrap">
                          {new Date(f.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-6 py-4 font-mono text-sm font-bold text-on-surface">
                          <div className="flex items-center gap-3">
                             <span className="material-symbols-outlined text-[16px] text-surface-container-highest">
                               {f.type === "SIP" ? "diamond" : "shield"}
                             </span>
                             {f.fundName}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#F1F0EC]">
                          <span className="font-mono text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm border bg-[#C9A84C]/10 text-[#C9A84C] border-[#C9A84C]/20">
                            {f.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-[#F1F0EC]/80 uppercase tracking-widest">
                          {f.platform}
                        </td>
                        <td className="px-6 py-4 font-mono text-sm font-bold text-on-surface text-right">
                          {formatCurrency(f.sipAmountPaise || 0)}
                        </td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => setEditingFund(f)} className="text-on-surface-variant/50 hover:text-[#C9A84C] transition-colors" title="Edit">
                                 <span className="material-symbols-outlined text-[18px]">edit</span>
                              </button>
                              <button onClick={() => handleDelete(f.id)} className="text-on-surface-variant/50 hover:text-red-400 transition-colors" title="Delete">
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
        isOpen={!!editingFund} 
        onClose={() => setEditingFund(null)} 
        onSuccess={() => { setEditingFund(null); fetchFunds(true); }}
        entryType="MUTUAL_FUND"
        entryData={editingFund}
      />
    </div>
  );
}
