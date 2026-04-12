"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function EditEntryModal({ isOpen, onClose, onSuccess, entryType, entryData }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Global Lookups
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);

  // TRANSACTION STATE
  const [txType, setTxType] = useState("EXPENSE");
  const [txAmount, setTxAmount] = useState("");
  const [txDate, setTxDate] = useState("");
  const [txDesc, setTxDesc] = useState("");
  const [txNote, setTxNote] = useState("");
  const [txAccountId, setTxAccountId] = useState("");
  const [txCategoryName, setTxCategoryName] = useState("");

  // STOCK STATE
  const [stockSymbol, setStockSymbol] = useState("");
  const [stockType, setStockType] = useState("BUY");
  const [stockPlatform, setStockPlatform] = useState("Zerodha");
  const [stockCharges, setStockCharges] = useState("");
  const [stockPnlAmount, setStockPnlAmount] = useState("");

  // MF STATE
  const [fundName, setFundName] = useState("");
  const [fundType, setFundType] = useState("SIP");
  const [fundPlatform, setFundPlatform] = useState("Zerodha");
  const [fundAmount, setFundAmount] = useState("");

  useEffect(() => {
    if (isOpen && entryData) {
      // Load Dropdowns
      Promise.all([
        api.get("/accounts").catch(() => ({ data: { data: [] } })),
        api.get("/categories").catch(() => ({ data: { data: [] } }))
      ]).then(([accRes, catRes]) => {
        setAccounts(accRes.data.data || []);
        setCategories(catRes.data.data || []);
      });

      // Populate Form
      if (entryType === "TRANSACTION") {
        setTxType(entryData.type);
        setTxAmount((entryData.amountPaise / 100).toString());
        setTxDate(entryData.date.split("T")[0]);
        setTxDesc(entryData.description || "");
        setTxNote(entryData.note || "");
        setTxAccountId(entryData.accountId);
        setTxCategoryName(entryData.category?.name || "Other");
      } else if (entryType === "STOCK") {
        setStockSymbol(entryData.symbol);
        setStockType(entryData.tradeType);
        setStockPlatform(entryData.platform || "Zerodha");
        setStockCharges((entryData.totalChargesPaise / 100).toString());
        setStockPnlAmount(((entryData.netPnlPaise || 0) / 100).toString().replace("-", ""));
        setTxDate(entryData.date.split("T")[0]);
      } else if (entryType === "MUTUAL_FUND") {
        setFundName(entryData.fundName);
        setFundType(entryData.type);
        setFundPlatform(entryData.platform || "Zerodha");
        setFundAmount(((entryData.sipAmountPaise || 0) / 100).toString());
        setTxDate(entryData.date.split("T")[0]);
      }
    }
  }, [isOpen, entryData, entryType]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      if (entryType === "TRANSACTION") {
        let categoryId = entryData.categoryId;
        if (txCategoryName && txCategoryName !== entryData.category?.name) {
          let cat = categories.find(c => c.name === txCategoryName && c.type === txType);
          if (!cat) {
            const newCat = await api.post("/categories", { name: txCategoryName, type: txType });
            cat = newCat.data.data;
          }
          categoryId = cat.id;
        }

        await api.patch(`/transactions/${entryData.id}`, {
          amountPaise: Math.round(parseFloat(txAmount) * 100),
          type: txType,
          date: new Date(txDate).toISOString(),
          description: txDesc || null,
          note: txNote || null,
          accountId: txAccountId,
          categoryId
        });
      } else if (entryType === "STOCK") {
        // Just directly patching StockTrade (Note: backend doesn't automatically update linked transaction right now, user accepts this as a journal)
        await api.patch(`/stock-trades/${entryData.id}`, {
          symbol: stockSymbol.toUpperCase(),
          tradeType: stockType,
          platform: stockPlatform,
          totalChargesPaise: stockCharges ? Math.round(parseFloat(stockCharges) * 100) : 0,
          netPnlPaise: stockType === "SELL" ? Math.round(parseFloat(stockPnlAmount || 0) * 100) : 0,
          date: new Date(txDate).toISOString()
        });
      } else if (entryType === "MUTUAL_FUND") {
        await api.patch(`/mutual-funds/${entryData.id}`, {
          fundName,
          type: fundType,
          platform: fundPlatform,
          sipAmountPaise: fundAmount ? Math.round(parseFloat(fundAmount) * 100) : 0,
          date: new Date(txDate).toISOString()
        });
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to update entry.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <h2 className="text-xl font-headline text-[#C9A84C]">Edit Record</h2>
            <p className="font-mono text-[10px] text-[#F1F0EC]/50 uppercase tracking-widest mt-1">
              Modifying {entryType.replace("_", " ")} Data
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-[#F1F0EC]/60 hover:text-[#C9A84C] transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-highest/50"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm font-mono flex items-center gap-3">
              <span className="material-symbols-outlined">error</span>
              {error}
            </div>
          )}

          {entryType === "TRANSACTION" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Amount (₹)</label>
                  <input type="number" step="0.01" className={inputClass} value={txAmount} onChange={e => setTxAmount(e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Type</label>
                  <select className={inputClass} value={txType} onChange={e => setTxType(e.target.value)}>
                    <option value="EXPENSE">Expense</option>
                    <option value="INCOME">Income</option>
                    <option value="TRANSFER">Transfer</option>
                    <option value="INVESTMENT">Investment</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Account</label>
                  <select className={inputClass} value={txAccountId} onChange={e => setTxAccountId(e.target.value)}>
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Category</label>
                  <input type="text" className={inputClass} value={txCategoryName} onChange={e => setTxCategoryName(e.target.value)} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <input type="text" className={inputClass} value={txDesc} onChange={e => setTxDesc(e.target.value)} />
              </div>
            </>
          )}

          {entryType === "STOCK" && (
            <div className="space-y-4">
               <div>
                  <label className={labelClass}>Symbol / Ticker</label>
                  <input type="text" className={inputClass} value={stockSymbol} onChange={e => setStockSymbol(e.target.value)} />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Trade Type</label>
                    <select className={inputClass} value={stockType} onChange={e => setStockType(e.target.value)}>
                      <option value="BUY">Buy</option>
                      <option value="SELL">Sell</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Platform</label>
                    <select className={inputClass} value={stockPlatform} onChange={e => setStockPlatform(e.target.value)}>
                      <option value="Zerodha">Zerodha</option>
                      <option value="Groww">Groww</option>
                      <option value="Dhan">Dhan</option>
                    </select>
                  </div>
               </div>
               {stockType === "SELL" && (
                 <div>
                    <label className={labelClass}>Net P&L (₹)</label>
                    <input type="number" step="0.01" className={inputClass} value={stockPnlAmount} onChange={e => setStockPnlAmount(e.target.value)} />
                 </div>
               )}
            </div>
          )}

          {entryType === "MUTUAL_FUND" && (
            <div className="space-y-4">
               <div>
                  <label className={labelClass}>Fund Name</label>
                  <input type="text" className={inputClass} value={fundName} onChange={e => setFundName(e.target.value)} />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Type</label>
                    <select className={inputClass} value={fundType} onChange={e => setFundType(e.target.value)}>
                      <option value="SIP">SIP</option>
                      <option value="LUMPSUM">Lumpsum</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Platform</label>
                    <select className={inputClass} value={fundPlatform} onChange={e => setFundPlatform(e.target.value)}>
                      <option value="Zerodha">Zerodha</option>
                      <option value="Groww">Groww</option>
                      <option value="Dhan">Dhan</option>
                    </select>
                  </div>
               </div>
               <div>
                  <label className={labelClass}>Amount (₹)</label>
                  <input type="number" step="0.01" className={inputClass} value={fundAmount} onChange={e => setFundAmount(e.target.value)} />
               </div>
            </div>
          )}

          <div>
             <label className={labelClass}>Date of Transaction</label>
             <input type="date" className={inputClass} value={txDate} onChange={e => setTxDate(e.target.value)} required />
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-[#F1F0EC]/10 flex gap-4 bg-[#12121f] rounded-b-2xl">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 py-3.5 rounded-xl font-mono text-xs uppercase tracking-widest text-on-surface-variant/60 hover:text-on-surface hover:bg-[#1a1a28] transition-colors font-bold"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="flex-1 bg-[#C9A84C] text-[#0d0d1a] py-3.5 rounded-xl font-mono text-xs uppercase tracking-widest font-bold hover:bg-[#d4b55b] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">save</span>
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
