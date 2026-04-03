"use client";

import { useState } from "react";

const demoTransactions = [
  { id: "1", date: "2024-10-12", type: "EXPENSE", category: "Food & Dining", note: "Zomato order", amount: "₹450.00", account: "HDFC Bank", tags: ["delivery"] },
  { id: "2", date: "2024-10-11", type: "INCOME", category: "Salary", note: "Oct salary credit", amount: "₹85,000.00", account: "HDFC Bank", tags: ["salary"] },
  { id: "3", date: "2024-10-10", type: "EXPENSE", category: "Travel", note: "Uber ride to office", amount: "₹320.00", account: "Paytm Wallet", tags: ["commute"] },
  { id: "4", date: "2024-10-09", type: "INVESTMENT", category: "Mutual Fund", note: "SIP - Bluechip Fund", amount: "₹10,000.00", account: "Investment", tags: ["sip"] },
  { id: "5", date: "2024-10-08", type: "EXPENSE", category: "Shopping", note: "Amazon order", amount: "₹2,499.00", account: "ICICI Credit Card", tags: ["electronics"] },
  { id: "6", date: "2024-10-07", type: "EXPENSE", category: "Utilities", note: "Electricity bill", amount: "₹1,850.00", account: "HDFC Bank", tags: ["bills"] },
];

export default function TransactionsPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-headline text-3xl text-on-surface">All Transactions</h2>
        <p className="text-on-surface-variant/60 text-sm">Unified expense, income, stock and mutual fund ledger</p>
      </div>

      {/* Filters */}
      <div className="glass-panel rounded-xl p-6">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          <div className="relative md:col-span-2">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant/40 text-[18px]">search</span>
            <input
              className="w-full bg-surface-container-low border border-outline-variant/20 focus:ring-1 focus:ring-tertiary text-sm py-2.5 pl-10 pr-4 rounded-lg placeholder:text-on-surface-variant/40 text-on-surface outline-none"
              placeholder="Search by note or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="bg-surface-container-low border border-outline-variant/20 text-sm py-2.5 px-3 rounded-lg text-on-surface outline-none focus:ring-1 focus:ring-tertiary">
            <option>All Categories</option>
            <option>Food & Dining</option>
            <option>Travel</option>
            <option>Shopping</option>
            <option>Utilities</option>
          </select>
          <select className="bg-surface-container-low border border-outline-variant/20 text-sm py-2.5 px-3 rounded-lg text-on-surface outline-none focus:ring-1 focus:ring-tertiary">
            <option>All Types</option>
            <option>Expense</option>
            <option>Income</option>
            <option>Investment</option>
            <option>Transfer</option>
          </select>
          <button className="gold-sheen px-4 py-2.5 rounded-lg text-on-tertiary font-bold text-sm hover:scale-95 transition-transform">
            Apply Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/40">Date</th>
                <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/40">Type</th>
                <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/40">Category</th>
                <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/40">Note</th>
                <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/40">Amount</th>
                <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/40">Account</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {demoTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-surface-container-highest/20 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-on-surface-variant">{tx.date}</td>
                  <td className="px-6 py-4">
                    <span className={`font-mono text-[10px] uppercase px-2 py-1 rounded ${
                      tx.type === "INCOME" ? "bg-green-500/10 text-green-400" :
                      tx.type === "INVESTMENT" ? "bg-tertiary/10 text-tertiary" :
                      "bg-red-500/10 text-red-400"
                    }`}>{tx.type}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface">{tx.category}</td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">{tx.note}</td>
                  <td className={`px-6 py-4 font-mono text-sm font-bold ${tx.type === "INCOME" ? "text-green-400" : "text-on-surface"}`}>{tx.amount}</td>
                  <td className="px-6 py-4 text-xs text-on-surface-variant/60">{tx.account}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
