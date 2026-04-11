"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

const CATEGORY_ICONS = {
  "Food & Dining": "restaurant",
  "Travel": "directions_car",
  "Shopping": "shopping_bag",
  "Entertainment": "movie",
  "Medical": "medical_services",
  "Utilities": "bolt",
  "Education": "school",
  "EMI / Loan": "receipt",
  "Fuel": "local_gas_station",
  "Groceries": "local_grocery_store",
  "Clothing": "checkroom",
  "Electronics": "devices",
  "Insurance": "health_and_safety",
  "Rent": "home",
  "Uncategorized": "category"
};

const CATEGORY_COLORS = ["bg-[#C9A84C]", "bg-blue-400", "bg-purple-400", "bg-green-400", "bg-orange-400", "bg-red-400", "bg-pink-400", "bg-cyan-400"];

export default function ExpensesPage() {
  const [breakdown, setBreakdown] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get("/dashboard/summary")
      .then(res => {
        const data = res.data.data;
        const eb = data?.expenseBreakdown || [];
        setBreakdown(eb);
        setTotalExpense(eb.reduce((s, e) => s + (e.amount || 0), 0));
        setMonthlyIncome((data?.metrics?.monthlyIncomePaise || 0) / 100);
      })
      .catch(err => console.error("Failed to fetch expense data:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const currentMonth = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline text-3xl text-on-surface">Expenses</h2>
          <p className="text-on-surface-variant/60 text-sm font-mono mt-1 uppercase tracking-widest">Category-wise spending analysis</p>
        </div>
      </div>

      {isLoading ? (
        <div className="glass-panel p-24 flex flex-col items-center justify-center gap-4 rounded-xl shadow-2xl">
          <span className="material-symbols-outlined text-[32px] text-[#C9A84C] animate-spin">refresh</span>
          <p className="font-mono text-xs uppercase tracking-widest text-[#F1F0EC]/60">Analyzing Spending Velocity...</p>
        </div>
      ) : (
        <>
          {/* Monthly Summary */}
          <div className="glass-panel rounded-xl p-8 text-center border border-outline-variant/10 shadow-2xl bg-[#0d0d1a]">
            <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-2">{currentMonth} Total Spend</p>
            <p className="font-mono text-4xl font-bold text-on-surface">
              ₹{totalExpense.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </p>
            {monthlyIncome > 0 && (
              <p className={`font-mono text-xs mt-2 ${totalExpense > monthlyIncome ? "text-red-400" : "text-green-400"}`}>
                {totalExpense > monthlyIncome ? "⚠ Spending exceeds income" : `${((totalExpense / monthlyIncome) * 100).toFixed(0)}% of monthly income`}
              </p>
            )}
          </div>

          {/* Category Cards */}
          {breakdown.length === 0 ? (
            <div className="glass-panel py-24 flex flex-col items-center justify-center gap-3 rounded-xl border border-outline-variant/10 shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-[32px] text-[#C9A84C]/80">payments</span>
              </div>
              <p className="font-headline text-lg text-[#C9A84C]">No Expenses This Month</p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-[#F1F0EC]/40 text-center max-w-sm leading-relaxed">
                Add expense transactions to see your category breakdown here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {breakdown.map((c, idx) => (
                <div key={c.name} className="glass-panel p-6 rounded-xl border border-outline-variant/10 shadow-xl bg-[#0d0d1a] relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                  <div className="absolute inset-0 bg-[#C9A84C]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#12121f] flex items-center justify-center rounded-lg border border-outline-variant/10 group-hover:border-[#C9A84C]/30 transition-colors">
                          <span className="material-symbols-outlined text-[#C9A84C]">{CATEGORY_ICONS[c.name] || "category"}</span>
                        </div>
                        <div>
                          <p className="font-bold text-on-surface text-sm">{c.name}</p>
                          <p className="font-mono text-[10px] text-[#F1F0EC]/60 uppercase tracking-widest">{c.percentage}% of total</p>
                        </div>
                      </div>
                    </div>
                    <p className="font-mono text-xl font-bold text-on-surface">
                      ₹{(c.amount || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                    </p>
                    {/* Mini progress bar */}
                    <div className="w-full bg-[#1a1a28] rounded-full h-1.5 overflow-hidden mt-3">
                      <div className={`h-full rounded-full ${CATEGORY_COLORS[idx % CATEGORY_COLORS.length]}`} style={{ width: `${c.percentage}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
