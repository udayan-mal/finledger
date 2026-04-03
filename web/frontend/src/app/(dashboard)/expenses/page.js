export default function ExpensesPage() {
  const categories = [
    { name: "Food & Dining", icon: "restaurant", spent: "₹9,800", count: 24, color: "bg-tertiary" },
    { name: "Travel & Transport", icon: "directions_car", spent: "₹6,200", count: 18, color: "bg-blue-400" },
    { name: "Shopping", icon: "shopping_bag", spent: "₹11,200", count: 8, color: "bg-purple-400" },
    { name: "Utilities & Bills", icon: "bolt", spent: "₹4,500", count: 5, color: "bg-green-400" },
    { name: "Entertainment", icon: "movie", spent: "₹2,300", count: 6, color: "bg-orange-400" },
    { name: "Medical & Health", icon: "medical_services", spent: "₹3,100", count: 3, color: "bg-red-400" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline text-3xl text-on-surface">Expenses</h2>
          <p className="text-on-surface-variant/60 text-sm">Track daily spending by category and trends</p>
        </div>
        <button className="gold-sheen px-6 py-2 rounded-md text-on-tertiary font-bold text-sm hover:scale-95 transition-transform">ADD EXPENSE</button>
      </div>

      {/* Monthly Summary */}
      <div className="glass-panel rounded-xl p-8 border-t border-tertiary/20 text-center">
        <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-2">October 2024 Total Spend</p>
        <p className="font-mono text-4xl font-bold text-on-surface">₹37,100</p>
        <p className="font-mono text-xs text-red-400/60 mt-1">+12% vs last month</p>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {categories.map((c) => (
          <div key={c.name} className="glass-panel p-6 rounded-xl hover:-translate-y-0.5 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-surface-container flex items-center justify-center rounded-lg border border-outline-variant/20">
                  <span className="material-symbols-outlined text-tertiary">{c.icon}</span>
                </div>
                <div>
                  <p className="font-bold text-on-surface text-sm">{c.name}</p>
                  <p className="font-mono text-[10px] text-on-surface-variant/60">{c.count} transactions</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant/40 hover:text-tertiary cursor-pointer transition-colors">chevron_right</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-xl font-bold text-on-surface">{c.spent}</span>
              <div className={`w-2 h-2 rounded-full ${c.color}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
