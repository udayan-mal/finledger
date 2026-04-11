"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function RecurringPage() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get("/recurring")
      .then(res => setItems(res.data.data || []))
      .catch(err => console.error("Failed to fetch recurring:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const formatCurrency = (paise) => `₹${((paise || 0) / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  const FREQ_ICONS = { Monthly: "calendar_month", Quarterly: "date_range", Yearly: "event", Weekly: "view_week" };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline text-3xl text-on-surface">Recurring</h2>
          <p className="text-on-surface-variant/60 text-sm font-mono mt-1 uppercase tracking-widest">Manage recurring bills, subscriptions, and commitments</p>
        </div>
      </div>

      {isLoading ? (
        <div className="glass-panel p-24 flex flex-col items-center justify-center gap-4 rounded-xl shadow-2xl">
          <span className="material-symbols-outlined text-[32px] text-[#C9A84C] animate-spin">refresh</span>
          <p className="font-mono text-xs uppercase tracking-widest text-[#F1F0EC]/60">Loading Subscriptions...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="glass-panel py-24 flex flex-col items-center justify-center gap-3 rounded-xl border border-outline-variant/10 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-2">
            <span className="material-symbols-outlined text-[32px] text-[#C9A84C]/80">event_repeat</span>
          </div>
          <p className="font-headline text-lg text-[#C9A84C]">No Recurring Expenses</p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-[#F1F0EC]/40 text-center max-w-sm leading-relaxed">
            You have no scheduled bills or subscriptions yet. Add recurring items to track due dates automatically.
          </p>
        </div>
      ) : (
        <div className="glass-panel border border-outline-variant/10 rounded-xl overflow-hidden shadow-2xl bg-[#0d0d1a]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-[#12121f] border-b border-outline-variant/10">
                  <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-[#C9A84C]/80 font-bold">Name</th>
                  <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-[#C9A84C]/80 font-bold text-right">Amount</th>
                  <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-[#C9A84C]/80 font-bold">Frequency</th>
                  <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-[#C9A84C]/80 font-bold">Next Due</th>
                  <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-[#C9A84C]/80 font-bold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                {items.map((item) => {
                  const due = new Date(item.nextDue);
                  const dueStr = due.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
                  const daysUntil = Math.ceil((due - new Date()) / (1000 * 60 * 60 * 24));
                  const urgent = daysUntil <= 3;
                  const overdue = daysUntil <= 0;

                  return (
                    <tr key={item.id} className="group hover:bg-[#1a1a28] transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 flex items-center justify-center rounded-lg border ${urgent ? "border-red-400/30 bg-red-500/10" : "border-outline-variant/10 bg-[#12121f]"} group-hover:border-[#C9A84C]/30 transition-colors`}>
                            <span className={`material-symbols-outlined text-[16px] ${urgent ? "text-red-400" : "text-[#C9A84C]"}`}>
                              {FREQ_ICONS[item.frequency] || "event"}
                            </span>
                          </div>
                          <span className="font-bold text-on-surface text-sm">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-sm font-bold text-on-surface text-right">{formatCurrency(item.amountPaise)}</td>
                      <td className="px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-[#F1F0EC]/60">{item.frequency}</td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-[#F1F0EC]/80">{dueStr}</span>
                        {urgent && <span className={`ml-2 font-mono text-[10px] font-bold ${overdue ? "text-red-500" : "text-orange-400"}`}>{overdue ? "OVERDUE" : `${daysUntil}d left`}</span>}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-mono text-[10px] uppercase px-3 py-1 rounded-full ${item.active ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-[#12121f] text-[#F1F0EC]/40 border border-outline-variant/10"}`}>
                          {item.active ? "Active" : "Paused"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
