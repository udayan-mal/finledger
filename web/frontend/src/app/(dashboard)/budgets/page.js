"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchBudgets() {
      try {
        // Fetch raw budgets + current month's calculated expenses from the dashboard aggregation engine
        const [budgetsRes, summaryRes] = await Promise.all([
          api.get("/budgets"),
          api.get("/dashboard/summary")
        ]);
        
        const rawBudgets = budgetsRes.data.data || [];
        const expenseBreakdown = summaryRes.data.data?.expenseBreakdown || [];

        // Map live spent data into the budget definitions natively
        const mappedBudgets = rawBudgets.map(b => {
           const categoryName = b.category?.name || "Uncategorized";
           // expenseBreakdown returns amount in Rupees (already divided by 100)
           const spentRupees = expenseBreakdown.find(eb => eb.name === categoryName)?.amount || 0;
           return {
             ...b,
             categoryName,
             spentPaise: spentRupees * 100,
             icon: b.category?.icon || "account_balance_wallet"
           };
        });

        setBudgets(mappedBudgets);
      } catch (err) {
        console.error("Failed to fetch budgets:", err);
        setError("Failed to decrypt secure budget metrics.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchBudgets();
  }, []);

  const bgColors = ["bg-tertiary", "bg-blue-400", "bg-red-400", "bg-purple-400", "bg-green-400"];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline text-3xl text-on-surface">Budget Planner</h2>
          <p className="text-on-surface-variant/60 text-sm">Set monthly control limits mapped to real-time telemetry</p>
        </div>
        <button className="gold-sheen px-6 py-2 rounded-md text-on-tertiary font-bold text-sm hover:scale-95 transition-transform flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">add</span>
          ADD BUDGET
        </button>
      </div>

      {isLoading ? (
        <div className="glass-panel p-24 flex flex-col items-center justify-center gap-4 rounded-xl shadow-2xl">
          <span className="material-symbols-outlined text-[32px] text-[#C9A84C] animate-spin">refresh</span>
          <p className="font-mono text-xs uppercase tracking-widest text-[#F1F0EC]/60">Parsing Spending Velocity...</p>
        </div>
      ) : error ? (
        <div className="glass-panel p-12 flex flex-col items-center justify-center gap-2 text-red-400 rounded-xl">
          <span className="material-symbols-outlined text-[32px]">error</span>
          <p className="font-mono text-xs uppercase tracking-widest">{error}</p>
        </div>
      ) : budgets.length === 0 ? (
        <div className="glass-panel py-24 flex flex-col items-center justify-center gap-3 rounded-xl border border-outline-variant/10 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-2">
            <span className="material-symbols-outlined text-[32px] text-[#C9A84C]/80">account_balance_wallet</span>
          </div>
          <p className="font-headline text-lg text-[#C9A84C]">No Active Budgets</p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-[#F1F0EC]/40 text-center max-w-sm leading-relaxed">
            You currently have no financial velocity limits. Click the <strong className="text-[#C9A84C]">ADD BUDGET</strong> control to govern your spending.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {budgets.map((b, idx) => {
            const spentObj = b.spentPaise / 100;
            const budgetObj = b.amountPaise / 100;
            const pct = Math.min(100, Math.round((spentObj / budgetObj) * 100));
            const over = spentObj > budgetObj;
            
            const color = bgColors[idx % bgColors.length];

            return (
              <div key={b.id} className="glass-panel p-6 rounded-xl border border-outline-variant/10 hover:-translate-y-1 transition-transform duration-300 shadow-xl bg-[#0d0d1a] relative group overflow-hidden">
                <div className="absolute inset-0 bg-[#C9A84C]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 ${over ? "bg-red-500/10" : "bg-[#12121f]"} flex items-center justify-center rounded-lg border border-outline-variant/10 group-hover:border-[#C9A84C]/30 transition-colors`}>
                      <span className={`material-symbols-outlined ${over ? "text-red-400" : "text-[#C9A84C]"}`}>{b.icon}</span>
                    </div>
                    <div>
                      <p className="font-bold text-on-surface text-sm truncate max-w-[150px]">{b.categoryName}</p>
                      <p className="font-mono text-[10px] text-[#F1F0EC]/60 uppercase tracking-widest">{b.period || "Monthly Budget"}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="font-mono text-lg font-bold text-on-surface">₹{spentObj.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                    <span className="font-mono text-xs text-on-surface-variant/60">/ ₹{budgetObj.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="w-full bg-[#1a1a28] rounded-full h-2 overflow-hidden shadow-inner flex">
                    <div className={`h-full rounded-full transition-all duration-1000 ease-out ${over ? "bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.5)]" : color}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between mt-3">
                    <span className={`font-mono text-[10px] uppercase tracking-widest font-bold ${over ? "text-red-400" : "text-[#C9A84C]"}`}>{pct}% consumed</span>
                    {over && <span className="font-mono text-[10px] uppercase tracking-widest text-red-500 font-bold animate-pulse">⚠ Warning</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
