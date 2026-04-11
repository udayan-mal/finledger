"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

const ACCOUNT_ICONS = {
  BANK: "account_balance",
  CASH: "payments",
  WALLET: "account_balance_wallet",
  INVESTMENT: "monitoring",
  LIABILITY: "credit_card"
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get("/accounts")
      .then(res => setAccounts(res.data.data || []))
      .catch(err => console.error("Failed to fetch accounts:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const formatBalance = (paise) => {
    const rupees = (paise || 0) / 100;
    const isNegative = rupees < 0;
    return `${isNegative ? "-" : ""}₹${Math.abs(rupees).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  };

  const totalBalance = accounts.reduce((sum, a) => sum + (a.balancePaise || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline text-3xl text-on-surface">Accounts</h2>
          <p className="text-on-surface-variant/60 text-sm font-mono mt-1 uppercase tracking-widest">Bank, cash, wallet balances and transfers</p>
        </div>
      </div>

      {isLoading ? (
        <div className="glass-panel p-24 flex flex-col items-center justify-center gap-4 rounded-xl shadow-2xl">
          <span className="material-symbols-outlined text-[32px] text-[#C9A84C] animate-spin">refresh</span>
          <p className="font-mono text-xs uppercase tracking-widest text-[#F1F0EC]/60">Loading Accounts...</p>
        </div>
      ) : accounts.length === 0 ? (
        <div className="glass-panel py-24 flex flex-col items-center justify-center gap-3 rounded-xl border border-outline-variant/10 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-2">
            <span className="material-symbols-outlined text-[32px] text-[#C9A84C]/80">account_balance</span>
          </div>
          <p className="font-headline text-lg text-[#C9A84C]">No Accounts Registered</p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-[#F1F0EC]/40 text-center max-w-sm leading-relaxed">
            Use the <strong className="text-[#C9A84C]">+ Quick Add</strong> modal to add a transaction — a default account will be created automatically.
          </p>
        </div>
      ) : (
        <>
          {/* Total Balance Card */}
          <div className="glass-panel rounded-xl p-8 text-center border border-outline-variant/10 shadow-2xl bg-[#0d0d1a]">
            <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-3">Combined Liquidity</p>
            <p className={`font-mono text-4xl font-bold ${totalBalance >= 0 ? "text-[#C9A84C]" : "text-red-400"}`}>{formatBalance(totalBalance)}</p>
            <p className="font-mono text-[10px] text-[#F1F0EC]/40 mt-2 uppercase tracking-widest">{accounts.length} account{accounts.length !== 1 ? "s" : ""} active</p>
          </div>

          {/* Account Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {accounts.map((a) => {
              const balance = a.balancePaise || 0;
              const isNeg = balance < 0;
              return (
                <div key={a.id} className="glass-panel p-6 rounded-xl border border-outline-variant/10 shadow-xl bg-[#0d0d1a] relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                  <div className="absolute inset-0 bg-[#C9A84C]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-[#12121f] flex items-center justify-center rounded-lg border border-outline-variant/10 group-hover:border-[#C9A84C]/30 transition-colors">
                        <span className={`material-symbols-outlined ${isNeg ? "text-red-400" : "text-[#C9A84C]"}`}>
                          {ACCOUNT_ICONS[a.type] || "account_balance_wallet"}
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-on-surface text-sm">{a.name}</p>
                        <p className="font-mono text-[10px] text-[#F1F0EC]/60 uppercase tracking-widest">{a.type}</p>
                      </div>
                    </div>
                    <p className={`font-mono text-2xl font-bold ${isNeg ? "text-red-400" : "text-on-surface"}`}>
                      {formatBalance(balance)}
                    </p>
                    <p className="font-mono text-[10px] text-[#F1F0EC]/40 mt-1 uppercase tracking-widest">
                      Created {new Date(a.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
