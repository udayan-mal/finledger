export default function AccountsPage() {
  const accounts = [
    { id: "1", name: "HDFC Savings", type: "BANK", icon: "account_balance", balance: "₹3,42,500", trend: "+₹18,200 this month" },
    { id: "2", name: "ICICI Credit Card", type: "BANK", icon: "credit_card", balance: "-₹24,800", trend: "Due: Oct 15" },
    { id: "3", name: "Cash in Hand", type: "CASH", icon: "payments", balance: "₹18,500", trend: "-₹3,200 this week" },
    { id: "4", name: "Paytm Wallet", type: "WALLET", icon: "account_balance_wallet", balance: "₹4,200", trend: "Last used today" },
    { id: "5", name: "PhonePe", type: "WALLET", icon: "phone_android", balance: "₹1,800", trend: "Last used 2d ago" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline text-3xl text-on-surface">Accounts</h2>
          <p className="text-on-surface-variant/60 text-sm">Bank, cash, wallet balances and transfers</p>
        </div>
        <button className="gold-sheen px-6 py-2 rounded-md text-on-tertiary font-bold text-sm hover:scale-95 transition-transform">ADD ACCOUNT</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {accounts.map((a) => (
          <div key={a.id} className="glass-panel p-6 rounded-xl border-t border-tertiary/20 hover:-translate-y-0.5 transition-transform">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-surface-container flex items-center justify-center rounded-lg border border-outline-variant/20">
                <span className="material-symbols-outlined text-tertiary">{a.icon}</span>
              </div>
              <div>
                <p className="font-bold text-on-surface text-sm">{a.name}</p>
                <p className="font-mono text-[10px] text-on-surface-variant/60 uppercase">{a.type}</p>
              </div>
            </div>
            <p className={`font-mono text-2xl font-bold ${a.balance.startsWith("-") ? "text-red-400" : "text-on-surface"}`}>{a.balance}</p>
            <p className="font-mono text-[10px] text-on-surface-variant/40 mt-1">{a.trend}</p>
          </div>
        ))}
      </div>

      {/* Transfer Section */}
      <div className="glass-panel rounded-xl p-8">
        <h3 className="font-headline text-xl text-on-surface mb-6">Quick Transfer</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select className="bg-surface-container-low border border-outline-variant/20 text-sm py-2.5 px-3 rounded-lg text-on-surface outline-none focus:ring-1 focus:ring-tertiary">
            <option>From: HDFC Savings</option>
            <option>From: Cash in Hand</option>
            <option>From: Paytm Wallet</option>
          </select>
          <select className="bg-surface-container-low border border-outline-variant/20 text-sm py-2.5 px-3 rounded-lg text-on-surface outline-none focus:ring-1 focus:ring-tertiary">
            <option>To: Cash in Hand</option>
            <option>To: Paytm Wallet</option>
            <option>To: PhonePe</option>
          </select>
          <input className="bg-surface-container-low border border-outline-variant/20 text-sm py-2.5 px-4 rounded-lg placeholder:text-on-surface-variant/40 text-on-surface outline-none focus:ring-1 focus:ring-tertiary" placeholder="Amount (₹)" type="number" />
        </div>
        <button className="gold-sheen mt-6 px-6 py-2.5 rounded-md text-on-tertiary font-bold text-sm hover:scale-95 transition-transform">Transfer</button>
      </div>
    </div>
  );
}
