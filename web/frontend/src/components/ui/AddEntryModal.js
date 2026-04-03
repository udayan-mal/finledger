"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

const TAB_OPTIONS = ["Transaction", "Stock Trade", "Mutual Fund"];

const DEFAULT_EXPENSE_CATEGORIES = [
  "Food & Dining", "Travel", "Entertainment", "Shopping", "Medical", 
  "Utilities", "Education", "EMI / Loan", "Fuel", "Groceries", 
  "Clothing", "Electronics", "Insurance", "Rent", "Other Expense"
];

const DEFAULT_INCOME_CATEGORIES = ["Salary", "Business", "Freelance", "Investment", "Other Income"];

export default function AddEntryModal({ isOpen, onClose, onSuccess }) {
  const [activeTab, setActiveTab] = useState("Transaction");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // General state
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  // Transaction specific state
  const [txnType, setTxnType] = useState("EXPENSE");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  
  // Database References
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [selectedCategoryName, setSelectedCategoryName] = useState("Food & Dining");

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

  useEffect(() => {
    if (isOpen) {
      // Fetch user's existing accounts and categories
      Promise.all([
        api.get("/accounts").catch(() => ({ data: [] })),
        api.get("/categories").catch(() => ({ data: [] }))
      ]).then(([accRes, catRes]) => {
        setAccounts(accRes.data);
        setCategories(catRes.data);
        if (accRes.data.length > 0) {
          setSelectedAccountId(accRes.data[0].id);
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Dynamically switch category dropdown based on Expense vs Income
  const categoryOptions = txnType === "EXPENSE" ? DEFAULT_EXPENSE_CATEGORIES : DEFAULT_INCOME_CATEGORIES;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (activeTab === "Transaction") {
        if (!amount || isNaN(amount)) throw new Error("Invalid amount");
        const amountPaise = Math.round(parseFloat(amount) * 100);

        // 1. Ensure we have an account to post to
        let finalAccountId = selectedAccountId;
        if (!finalAccountId) {
          // Auto-create a default wallet if user has absolutely no accounts
          const newAcc = await api.post("/accounts", {
            name: "Main Wallet",
            type: "WALLET",
            balancePaise: 0
          });
          finalAccountId = newAcc.data.id;
        }

        // 2. Ensure we have a valid associated Category ID
        let categoryId = null;
        if (selectedCategoryName) {
          let cat = categories.find(c => c.name === selectedCategoryName && c.type === txnType);
          if (!cat) {
            // Auto-create category in backend if it doesn't physically exist for this user yet
            const newCat = await api.post("/categories", {
              name: selectedCategoryName,
              type: txnType
            });
            cat = newCat.data;
          }
          categoryId = cat.id;
        }

        // 3. Post Transaction
        await api.post("/transactions", {
          accountId: finalAccountId,
          categoryId: categoryId,
          type: txnType,
          amountPaise: amountPaise,
          date: new Date(date).toISOString(),
          note: description,
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
      
      // Clear form and respond to shell
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Submission error:", err);
      setError(err.response?.data?.error || err.message || "Failed to add entry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Label style utility
  const labelClass = "block text-[10px] font-mono uppercase tracking-widest text-[#F1F0EC]/60 mb-2";
  const inputClass = "w-full bg-[#12121f] text-[#F1F0EC] border border-[#F1F0EC]/10 rounded-lg px-4 py-3 placeholder-[#F1F0EC]/30 focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] outline-none transition-all";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-[#1a1a28] rounded-2xl border border-[#F1F0EC]/10 shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-5 border-b border-[#F1F0EC]/10">
          <div>
            <h2 className="text-xl font-headline text-[#C9A84C]">Quick Add Entry</h2>
            <p className="font-mono text-[10px] text-[#F1F0EC]/50 uppercase tracking-widest mt-1">
              Securely injecting data into ledger
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-[#F1F0EC]/60 hover:text-[#C9A84C] transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-highest/50"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="px-8 pt-6">
          <div className="flex bg-[#12121f] rounded-lg p-1 border border-[#F1F0EC]/10 overflow-x-auto no-scrollbar">
            {TAB_OPTIONS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 min-w-[100px] text-xs font-mono uppercase tracking-wider py-2.5 rounded-md transition-all duration-300 ${
                  activeTab === tab 
                    ? "bg-[#C9A84C] text-[#0d0d1a] font-bold shadow-[0_2px_10px_0_rgba(201,168,76,0.2)]" 
                    : "text-[#F1F0EC]/60 hover:text-[#F1F0EC]"
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
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg mb-6 text-sm font-mono flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}

          <form id="quickAddForm" onSubmit={handleSubmit} className="space-y-6">
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
                      onChange={(e) => {
                        setTxnType(e.target.value);
                        setSelectedCategoryName(e.target.value === "EXPENSE" ? "Food & Dining" : "Salary");
                      }}
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Account</label>
                    <select 
                      className={inputClass}
                      value={selectedAccountId}
                      onChange={(e) => setSelectedAccountId(e.target.value)}
                    >
                      {accounts.length ? (
                        accounts.map(acc => (
                          <option key={acc.id} value={acc.id}>{acc.name}</option>
                        ))
                      ) : (
                        <option value="">Auto-create Wallet</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Category</label>
                    <select 
                      className={inputClass}
                      value={selectedCategoryName}
                      onChange={(e) => setSelectedCategoryName(e.target.value)}
                    >
                      {categoryOptions.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Description / Note</label>
                  <input 
                    type="text" 
                    className={inputClass} 
                    placeholder="e.g. Monthly groceries"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
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
        <div className="px-8 py-5 border-t border-[#F1F0EC]/10 bg-[#12121f]/80 rounded-b-2xl flex justify-end gap-4">
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
