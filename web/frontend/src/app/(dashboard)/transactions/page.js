"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function TransactionsPage() {
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All Categories");
  const [filterType, setFilterType] = useState("All Types");
  
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const { data } = await api.get("/transactions");
        setTransactions(data);
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
        setError("Failed to load transactions.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchTransactions();
  }, []);

  // Formatters
  const formatCurrency = (paise) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(paise / 100);
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  // Filtering Logic
  const filteredData = transactions.filter(tx => {
    const desc = (tx.description || "") + " " + (tx.note || "");
    const matchesSearch = desc.toLowerCase().includes(search.toLowerCase());
    
    const catName = tx.category?.name || "Uncategorized";
    const matchesCategory = filterCategory === "All Categories" || catName === filterCategory;

    const matchesType = filterType === "All Types" || tx.type === filterType.toUpperCase();

    return matchesSearch && matchesCategory && matchesType;
  });

  const uniqueCategories = ["All Categories", ...new Set(transactions.map(tx => tx.category?.name || "Uncategorized"))];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="font-headline text-3xl text-on-surface">All Transactions</h2>
        <p className="text-on-surface-variant/60 text-sm font-mono mt-1 uppercase tracking-widest">
          Unified expense, income, and transfer ledger
        </p>
      </div>

      {/* Filters Base */}
      <div className="glass-panel border border-outline-variant/10 rounded-xl p-6 shadow-xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#C9A84C]/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4"></div>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5 relative z-10">
          <div className="relative md:col-span-2">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant/40 text-[20px]">search</span>
            <input
              className="w-full bg-[#12121f] border border-outline-variant/20 focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/50 text-sm py-3 pl-10 pr-4 rounded-lg placeholder:text-on-surface-variant/30 text-on-surface outline-none transition-all shadow-inner"
              placeholder="Search descriptions or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <select 
            className="bg-[#12121f] border border-outline-variant/20 text-sm py-3 px-4 rounded-lg text-on-surface outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/50 transition-all cursor-pointer"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            {uniqueCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select 
            className="bg-[#12121f] border border-outline-variant/20 text-sm py-3 px-4 rounded-lg text-on-surface outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/50 transition-all cursor-pointer"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="All Types">All Types</option>
            <option value="Expense">Expense</option>
            <option value="Income">Income</option>
            <option value="Transfer">Transfer</option>
            <option value="Investment">Investment</option>
          </select>
          
          <button className="bg-[#C9A84C] text-[#0d0d1a] px-4 py-3 rounded-lg font-mono text-xs uppercase tracking-widest font-bold hover:bg-[#d4b55b] transition-all shadow-[0_4px_14px_0_rgba(201,168,76,0.39)] transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50">
            Export CSV
          </button>
        </div>
      </div>

      {/* Table Structure */}
      <div className="glass-panel border border-outline-variant/10 rounded-xl overflow-hidden shadow-2xl bg-[#0d0d1a]">
        
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4">
            <span className="material-symbols-outlined text-[32px] text-[#C9A84C] animate-spin">refresh</span>
            <p className="font-mono text-xs uppercase tracking-widest text-on-surface-variant/40">Decrypting ledger data...</p>
          </div>
        ) : error ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-red-400">
            <span className="material-symbols-outlined text-[32px]">error</span>
            <p className="font-mono text-xs uppercase tracking-widest">{error}</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
             <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-2">
               <span className="material-symbols-outlined text-[32px] text-on-surface-variant/30">receipt_long</span>
             </div>
             <p className="font-headline text-lg text-on-surface-variant/80">No entries found</p>
             <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/40 text-center max-w-xs">
               Your ledger is empty. Use the Quick Add button at the top to inject a transaction.
             </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-[#12121f] border-b border-outline-variant/10">
                  <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-[#C9A84C]/80 font-bold">Date</th>
                  <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-[#C9A84C]/80 font-bold">Type</th>
                  <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-[#C9A84C]/80 font-bold">Category</th>
                  <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-[#C9A84C]/80 font-bold">Description / Note</th>
                  <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-[#C9A84C]/80 font-bold text-right">Amount</th>
                  <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-[#C9A84C]/80 font-bold">Account</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                {filteredData.map((tx) => (
                  <tr key={tx.id} className="group hover:bg-[#1a1a28] transition-colors duration-200">
                    <td className="px-6 py-4 font-mono text-xs text-on-surface-variant/80 whitespace-nowrap">
                      {formatDate(tx.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`font-mono text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm border ${
                        tx.type === "INCOME" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                        tx.type === "INVESTMENT" ? "bg-[#C9A84C]/10 text-[#C9A84C] border-[#C9A84C]/20" :
                        tx.type === "TRANSFER" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                        "bg-red-500/10 text-red-400 border-red-500/20"
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface">
                      <div className="flex items-center gap-2">
                        {/* Placeholder dot based on category length or hash -- purely aesthetic detail */}
                        <div className="w-1.5 h-1.5 rounded-full bg-surface-container-highest"></div>
                        {tx.category?.name || "Uncategorized"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-on-surface font-medium truncate max-w-[200px]">{tx.description || "-None-"}</p>
                      {tx.note && <p className="text-xs text-on-surface-variant/50 truncate max-w-[200px] mt-0.5">{tx.note}</p>}
                    </td>
                    <td className={`px-6 py-4 font-mono text-sm font-bold text-right whitespace-nowrap ${
                      tx.type === "INCOME" ? "text-green-400" : 
                      tx.type === "EXPENSE" ? "text-red-400" : 
                      "text-on-surface"
                    }`}>
                      {tx.type === "EXPENSE" ? "-" : tx.type === "INCOME" ? "+" : ""}{formatCurrency(tx.amountPaise)}
                    </td>
                    <td className="px-6 py-4 text-xs text-on-surface-variant/60 uppercase tracking-wider font-mono">
                      {tx.account?.name || "Unknown"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
