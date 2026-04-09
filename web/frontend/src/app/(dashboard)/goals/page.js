"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchGoals() {
      try {
        const { data } = await api.get("/goals");
        setGoals(data.data || []);
      } catch (err) {
        console.error("Failed to fetch goals:", err);
        setError("Failed to decrypt goal data.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchGoals();
  }, []);

  // Standard material icons for dynamic cycling
  const goalIcons = ["flight", "shield", "laptop_mac", "home", "directions_car"];
  const goalColors = ["bg-tertiary", "bg-green-400", "bg-blue-400", "bg-purple-400", "bg-pink-400"];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline text-3xl text-on-surface">Goals & Savings</h2>
          <p className="text-on-surface-variant/60 text-sm">Track progress toward your financial milestones</p>
        </div>
        <button className="gold-sheen px-6 py-2 rounded-md text-on-tertiary font-bold text-sm hover:scale-95 transition-transform flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">add</span>
          NEW GOAL
        </button>
      </div>

      {isLoading ? (
        <div className="glass-panel p-24 flex flex-col items-center justify-center gap-4 rounded-xl shadow-2xl">
          <span className="material-symbols-outlined text-[32px] text-[#C9A84C] animate-spin">refresh</span>
          <p className="font-mono text-xs uppercase tracking-widest text-[#F1F0EC]/60">Parsing Goals Ledger...</p>
        </div>
      ) : error ? (
        <div className="glass-panel p-12 flex flex-col items-center justify-center gap-2 text-red-400 rounded-xl">
          <span className="material-symbols-outlined text-[32px]">error</span>
          <p className="font-mono text-xs uppercase tracking-widest">{error}</p>
        </div>
      ) : goals.length === 0 ? (
        <div className="glass-panel py-24 flex flex-col items-center justify-center gap-3 rounded-xl border border-outline-variant/10 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-2">
            <span className="material-symbols-outlined text-[32px] text-[#C9A84C]/80">sports_score</span>
          </div>
          <p className="font-headline text-lg text-[#C9A84C]">No Active Goals</p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-[#F1F0EC]/40 text-center max-w-sm leading-relaxed">
            You haven't established any financial milestones yet. Click the <strong className="text-[#C9A84C]">NEW GOAL</strong> button to set targets.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {goals.map((g, idx) => {
            const currentObjPaise = parseFloat(g.currentAmountPaise) || 0;
            const targetObjPaise = parseFloat(g.targetAmountPaise) || 1;
            const pct = Math.min(100, Math.round((currentObjPaise / targetObjPaise) * 100));
            const done = pct >= 100;
            
            const icon = goalIcons[idx % goalIcons.length];
            const color = goalColors[idx % goalColors.length];
            
            // Safe decimal formatting
            const currentDecimal = (currentObjPaise / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 });
            const targetDecimal = (targetObjPaise / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 });
            const deadlineObj = new Date(g.targetDate);
            const deadlineText = isNaN(deadlineObj.getTime()) ? "No Timeline" : deadlineObj.toLocaleDateString("en-US", { month: 'short', year: 'numeric' });

            return (
              <div key={g.id} className="glass-panel p-6 rounded-xl border border-outline-variant/10 shadow-xl bg-[#0d0d1a] relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                <div className="absolute inset-0 bg-[#C9A84C]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-[#12121f] flex items-center justify-center rounded-lg border border-outline-variant/10 group-hover:border-[#C9A84C]/30 transition-colors">
                      <span className={`material-symbols-outlined ${done ? "text-green-400" : "text-[#C9A84C]"}`}>{icon}</span>
                    </div>
                    <div>
                      <p className="font-bold text-on-surface truncate max-w-[150px]">{g.name}</p>
                      <p className="font-mono text-[10px] text-on-surface-variant/60 uppercase tracking-widest">{deadlineText}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="font-mono text-lg font-bold text-on-surface">₹{currentDecimal}</span>
                    <span className="font-mono text-xs text-on-surface-variant/60">/ ₹{targetDecimal}</span>
                  </div>
                  <div className="w-full bg-[#1a1a28] rounded-full h-2.5 overflow-hidden shadow-inner">
                    <div className={`h-full rounded-full transition-all duration-1000 ease-out ${done ? "bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]" : color}`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className={`font-mono text-[10px] uppercase tracking-widest mt-2 ${done ? "text-green-400 font-bold" : "text-[#F1F0EC]/60"}`}>
                    {done ? "✓ Goal achieved!" : `${pct}% complete`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
