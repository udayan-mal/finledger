"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function NetWorthPage() {
  const [metrics, setMetrics] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/dashboard/summary"),
      api.get("/accounts")
    ])
      .then(([summaryRes, accountsRes]) => {
        setMetrics(summaryRes.data.data?.metrics || {});
        setAccounts(accountsRes.data.data || []);
      })
      .catch(err => console.error("Failed to fetch net worth data:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const formatCurrency = (paise) => {
    const rupees = (paise || 0) / 100;
    const isNeg = rupees < 0;
    return `${isNeg ? "-" : ""}₹${Math.abs(rupees).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  };

  // Split accounts into assets vs liabilities
  const assets = accounts.filter(a => a.type !== "LIABILITY");
  const liabilities = accounts.filter(a => a.type === "LIABILITY");

  const totalAssets = assets.reduce((s, a) => s + (a.balancePaise || 0), 0);
  const totalLiabilities = liabilities.reduce((s, a) => s + Math.abs(a.balancePaise || 0), 0);
  const netWorth = (metrics?.netWorthPaise || 0);

  const ASSET_ICONS = { BANK: "account_balance", CASH: "payments", WALLET: "account_balance_wallet", INVESTMENT: "monitoring" };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="font-headline text-3xl text-on-surface">Net Worth</h2>
        <p className="text-on-surface-variant/60 text-sm font-mono mt-1 uppercase tracking-widest">Assets minus liabilities</p>
      </div>

      {isLoading ? (
        <div className="glass-panel p-24 flex flex-col items-center justify-center gap-4 rounded-xl shadow-2xl">
          <span className="material-symbols-outlined text-[32px] text-[#C9A84C] animate-spin">refresh</span>
          <p className="font-mono text-xs uppercase tracking-widest text-[#F1F0EC]/60">Computing Net Worth...</p>
        </div>
      ) : (
        <>
          {/* Hero Number */}
          <div className="glass-panel rounded-xl p-10 text-center border border-outline-variant/10 shadow-2xl bg-[#0d0d1a]">
            <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-3">Total Net Worth</p>
            <p className={`font-mono text-5xl font-bold ${netWorth >= 0 ? "text-[#C9A84C]" : "text-red-400"}`}>{formatCurrency(netWorth)}</p>
            <div className="flex items-center justify-center gap-4 mt-4">
              <span className="font-mono text-xs text-green-400">Assets: {formatCurrency(totalAssets)}</span>
              <span className="text-[#F1F0EC]/20">|</span>
              <span className="font-mono text-xs text-red-400">Liabilities: {formatCurrency(totalLiabilities)}</span>
            </div>
            {metrics?.portfolioValuePaise > 0 && (
              <p className="font-mono text-[10px] text-[#F1F0EC]/40 mt-2">Includes portfolio value of {formatCurrency(metrics.portfolioValuePaise)}</p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Assets */}
            <div className="space-y-4">
              <h3 className="font-headline text-xl text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-green-400 text-[20px]">arrow_upward</span>Assets
                <span className="font-mono text-xs text-green-400 ml-auto">{formatCurrency(totalAssets)}</span>
              </h3>
              {assets.length === 0 ? (
                <div className="glass-panel rounded-xl p-8 text-center border border-outline-variant/10">
                  <p className="font-mono text-xs text-[#F1F0EC]/40">No asset accounts found</p>
                </div>
              ) : assets.map((a) => (
                <div key={a.id} className="glass-panel rounded-xl p-5 flex items-center justify-between border border-outline-variant/10 bg-[#0d0d1a] group hover:-translate-y-0.5 transition-transform duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#12121f] flex items-center justify-center rounded-lg border border-outline-variant/10 group-hover:border-[#C9A84C]/30 transition-colors">
                      <span className="material-symbols-outlined text-[#C9A84C] text-[18px]">{ASSET_ICONS[a.type] || "account_balance_wallet"}</span>
                    </div>
                    <div>
                      <span className="text-sm text-on-surface">{a.name}</span>
                      <p className="font-mono text-[10px] text-[#F1F0EC]/40 uppercase">{a.type}</p>
                    </div>
                  </div>
                  <span className="font-mono text-sm font-bold text-green-400">{formatCurrency(a.balancePaise)}</span>
                </div>
              ))}
            </div>

            {/* Liabilities */}
            <div className="space-y-4">
              <h3 className="font-headline text-xl text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-red-400 text-[20px]">arrow_downward</span>Liabilities
                <span className="font-mono text-xs text-red-400 ml-auto">{formatCurrency(totalLiabilities)}</span>
              </h3>
              {liabilities.length === 0 ? (
                <div className="glass-panel rounded-xl p-8 text-center border border-outline-variant/10">
                  <p className="font-mono text-xs text-[#F1F0EC]/40">No liabilities — debt free! 🎉</p>
                </div>
              ) : liabilities.map((l) => (
                <div key={l.id} className="glass-panel rounded-xl p-5 flex items-center justify-between border border-outline-variant/10 bg-[#0d0d1a] group hover:-translate-y-0.5 transition-transform duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#12121f] flex items-center justify-center rounded-lg border border-red-400/20 group-hover:border-red-400/40 transition-colors">
                      <span className="material-symbols-outlined text-red-400 text-[18px]">credit_card</span>
                    </div>
                    <span className="text-sm text-on-surface">{l.name}</span>
                  </div>
                  <span className="font-mono text-sm font-bold text-red-400">{formatCurrency(Math.abs(l.balancePaise))}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
