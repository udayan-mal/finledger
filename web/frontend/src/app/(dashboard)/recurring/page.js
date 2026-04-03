export default function RecurringPage() {
  const items = [
    { id: "1", name: "House Rent", icon: "home", amount: "₹25,000", freq: "Monthly", nextDue: "Oct 1, 2024", active: true },
    { id: "2", name: "Netflix Subscription", icon: "tv", amount: "₹649", freq: "Monthly", nextDue: "Oct 15, 2024", active: true },
    { id: "3", name: "SIP - Bluechip Fund", icon: "account_balance", amount: "₹10,000", freq: "Monthly", nextDue: "Oct 12, 2024", active: true },
    { id: "4", name: "Electricity Bill", icon: "bolt", amount: "~₹1,800", freq: "Monthly", nextDue: "Oct 20, 2024", active: true },
    { id: "5", name: "Gym Membership", icon: "fitness_center", amount: "₹2,500", freq: "Quarterly", nextDue: "Dec 1, 2024", active: false },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline text-3xl text-on-surface">Recurring</h2>
          <p className="text-on-surface-variant/60 text-sm">Manage recurring bills, subscriptions, and commitments</p>
        </div>
        <button className="gold-sheen px-6 py-2 rounded-md text-on-tertiary font-bold text-sm hover:scale-95 transition-transform">ADD RECURRING</button>
      </div>

      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/40">Name</th>
                <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/40">Amount</th>
                <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/40">Frequency</th>
                <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/40">Next Due</th>
                <th className="px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/40">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-surface-container-highest/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-surface-container flex items-center justify-center rounded-lg border border-outline-variant/20">
                        <span className="material-symbols-outlined text-tertiary text-[18px]">{item.icon}</span>
                      </div>
                      <span className="font-bold text-on-surface text-sm">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm text-on-surface">{item.amount}</td>
                  <td className="px-6 py-4 font-mono text-[10px] uppercase text-on-surface-variant">{item.freq}</td>
                  <td className="px-6 py-4 font-mono text-xs text-on-surface-variant">{item.nextDue}</td>
                  <td className="px-6 py-4">
                    <span className={`font-mono text-[10px] uppercase px-2 py-1 rounded ${item.active ? "bg-green-500/10 text-green-400" : "bg-surface-container-highest text-on-surface-variant/40"}`}>
                      {item.active ? "Active" : "Paused"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
