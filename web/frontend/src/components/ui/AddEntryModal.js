"use client";

import { useState } from "react";
import { api } from "@/lib/api";

const TAB_OPTIONS = ["Transaction", "Stock Trade", "Mutual Fund"];

export default function AddEntryModal({ isOpen, onClose, onSuccess }) {
  const [activeTab, setActiveTab] = useState("Transaction");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // General state
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  // Transaction specific state
  const [txnType, setTxnType] = useState("EXPENSE");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  // Stock Trade specific state
  const [stockSymbol, setStockSymbol] = useState("");
  const [stockQty, setStockQty] = useState("");
  const [stockPrice, setStockPrice] = useState("");
  const [stockType, setStockType] = useState("BUY");

  // Mutual Fund specific state
  const [fundName, setFundName] = useState("");
  const [fundUnits, setFundUnits] = useState("");
  const [fundNav, setFundNav] = useState("");
  const [fundType, setFundType] = useState("SIP");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (activeTab === "Transaction") {
        if (!amount || isNaN(amount)) throw new Error("Invalid amount");
        // Convert to paise safely
        const amountPaise = Math.round(parseFloat(amount) * 100);

        await api.post("/transactions", {
          // Hardcoding standard categories/accounts for MVP logic to avoid blocking users
          accountId: "00000000-0000-0000-0000-000000000000",
          categoryId: "00000000-0000-0000-0000-000000000000",
          type: txnType,
          amountPaise: amountPaise,
          date: new Date(date).toISOString(),
          note: note,
        });
      } else if (activeTab === "Stock Trade") {
        if (!stockSymbol || !stockQty || !stockPrice) throw new Error("Missing stock fields");
        const pricePaise = Math.round(parseFloat(stockPrice) * 100);
        
        await api.post("/stock-trades", {
          symbol: stockSymbol.toUpperCase(),
          qty: parseInt(stockQty, 10),
          pricePaise,
          tradeType: stockType,
          date: new Date(date).toISOString(),
        });
      } else if (activeTab === "Mutual Fund") {
        if (!fundName || !fundUnits || !fundNav) throw new Error("Missing fund fields");
        const navPaise = Math.round(parseFloat(fundNav) * 100);
        
        await api.post("/mutual-funds", {
          fundName,
          units: parseFloat(fundUnits),
          navAtBuyPaise: navPaise,
          type: fundType,
          date: new Date(date).toISOString(),
        });
      }
      
      // Clear form and close
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Submission error:", err);
      setError(err.response?.data?.error || err.message || "Failed to add entry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Label style utility
  const labelClass = "block text-[10px] font-mono uppercase tracking-widest text-on-surface-variant/60 mb-2";
  const inputClass = "w-full bg-[#12121f] text-on-surface border border-outline-variant/20 rounded-lg px-4 py-3 placeholder-on-surface-variant/30 focus:border-tertiary focus:ring-1 focus:ring-tertiary outline-none transition-all";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-[#1a1a28] rounded-2xl border border-outline-variant/10 shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-5 border-b border-outline-variant/10">
          <div>
            <h2 className="text-xl font-headline text-tertiary-container">Quick Add Entry</h2>
            <p className="font-mono text-[10px] text-on-surface-variant/50 uppercase tracking-widest mt-1">
              Securely injecting data into ledger
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-on-surface-variant hover:text-tertiary transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-highest/50"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="px-8 pt-6">
          <div className="flex bg-[#12121f] rounded-lg p-1 border border-outline-variant/10 overflow-x-auto no-scrollbar">
            {TAB_OPTIONS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 min-w-[100px] text-xs font-mono uppercase tracking-wider py-2.5 rounded-md transition-all duration-300 ${
                  activeTab === tab 
                    ? "bg-[#C9A84C] text-[#0d0d1a] font-bold shadow-md" 
                    : "text-on-surface-variant/60 hover:text-on-surface-variant"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="px-8 py-6 overflow-y-auto flex-1 no-scrollbar">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg mb-6 text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}

          <form id="quickAddForm" onSubmit={handleSubmit} className="space-y-5">
            {/* Common Fields */}
            <div>
              <label className={labelClass}>Date of Transaction</label>
              <input 
                type="date" 
                className={inputClass}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            {/* Transaction Fields */}
            {activeTab === "Transaction" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Type</label>
                    <select 
                      className={inputClass}
                      value={txnType}
                      onChange={(e) => setTxnType(e.target.value)}
                    >
                      <option value="EXPENSE">Expense</option>
                      <option value="INCOME">Income</option>
                      <option value="TRANSFER">Transfer</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Amount (₹)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      min="0"
                      className={inputClass} 
                      placeholder="e.g. 5000"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Note / Reference</label>
                  <input 
                    type="text" 
                    className={inputClass} 
                    placeholder="e.g. Monthly groceries"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Stock Trade Fields */}
            {activeTab === "Stock Trade" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Symbol / Ticker</label>
                    <input 
                      type="text" 
                      className={inputClass} 
                      placeholder="e.g. RELIANCE"
                      value={stockSymbol}
                      onChange={(e) => setStockSymbol(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Trade Type</label>
                    <select 
                      className={inputClass}
                      value={stockType}
                      onChange={(e) => setStockType(e.target.value)}
                    >
                      <option value="BUY">Buy</option>
                      <option value="SELL">Sell</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Quantity</label>
                    <input 
                      type="number" 
                      min="1"
                      className={inputClass} 
                      placeholder="Units"
                      value={stockQty}
                      onChange={(e) => setStockQty(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Price (₹)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      min="0"
                      className={inputClass} 
                      placeholder="Per unit"
                      value={stockPrice}
                      onChange={(e) => setStockPrice(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {/* Mutual Fund Fields */}
            {activeTab === "Mutual Fund" && (
              <>
                <div>
                  <label className={labelClass}>Fund Name</label>
                  <input 
                    type="text" 
                    className={inputClass} 
                    placeholder="e.g. Parag Parikh Flexi Cap"
                    value={fundName}
                    onChange={(e) => setFundName(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <label className={labelClass}>Type</label>
                    <select 
                      className={inputClass}
                      value={fundType}
                      onChange={(e) => setFundType(e.target.value)}
                    >
                      <option value="SIP">SIP</option>
                      <option value="LUMPSUM">Lumpsum</option>
                    </select>
                  </div>
                  <div className="col-span-1">
                    <label className={labelClass}>Units</label>
                    <input 
                      type="number" 
                      step="0.001"
                      min="0"
                      className={inputClass} 
                      placeholder="0.000"
                      value={fundUnits}
                      onChange={(e) => setFundUnits(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-span-1">
                    <label className={labelClass}>Buy NAV(₹)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      min="0"
                      className={inputClass} 
                      placeholder="0.00"
                      value={fundNav}
                      onChange={(e) => setFundNav(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </>
            )}
          </form>
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-5 border-t border-outline-variant/10 bg-[#12121f]/50 rounded-b-2xl flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg font-mono text-xs uppercase tracking-widest text-[#F1F0EC]/60 hover:text-[#F1F0EC] hover:bg-[#1a1a28] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="quickAddForm"
            disabled={isSubmitting}
            className="px-8 py-2.5 rounded-lg font-mono text-xs uppercase tracking-widest bg-[#C9A84C] text-[#0d0d1a] font-bold hover:bg-[#d4b55b] disabled:opacity-50 transition-colors flex items-center gap-2 shadow-[0_4px_14px_0_rgba(201,168,76,0.39)]"
          >
            {isSubmitting ? (
              <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
            ) : (
              <span className="material-symbols-outlined text-[16px]">add</span>
            )}
            Add Entry
          </button>
        </div>
      </div>
    </div>
  );
}
