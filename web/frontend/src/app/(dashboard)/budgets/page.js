export default function BudgetsPage() {
  const budgets = [
    { id: "1", category: "Food & Dining", icon: "restaurant", budget: 15000, spent: 9800, color: "bg-tertiary" },
    { id: "2", category: "Travel", icon: "directions_car", budget: 8000, spent: 6200, color: "bg-blue-400" },
    { id: "3", category: "Shopping", icon: "shopping_bag", budget: 10000, spent: 11200, color: "bg-red-400" },
    { id: "4", category: "Entertainment", icon: "movie", budget: 5000, spent: 2300, color: "bg-purple-400" },
    { id: "5", category: "Utilities", icon: "bolt", budget: 6000, spent: 4500, color: "bg-green-400" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline text-3xl text-on-surface">Budget Planner</h2>
          <p className="text-on-surface-variant/60 text-sm">Set monthly budgets and track real-time spending</p>
        </div>
        <button className="gold-sheen px-6 py-2 rounded-md text-on-tertiary font-bold text-sm hover:scale-95 transition-transform">ADD BUDGET</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {budgets.map((b) => {
          const pct = Math.min(100, Math.round((b.spent / b.budget) * 100));
          const over = b.spent > b.budget;
          return (
            <div key={b.id} className="glass-panel p-6 rounded-xl border-t border-tertiary/20 hover:-translate-y-0.5 transition-transform">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-surface-container flex items-center justify-center rounded-lg border border-outline-variant/20">
                  <span className="material-symbols-outlined text-tertiary">{b.icon}</span>
                </div>
                <div>
                  <p className="font-bold text-on-surface text-sm">{b.category}</p>
                  <p className="font-mono text-[10px] text-on-surface-variant/60 uppercase">Monthly Budget</p>
                </div>
              </div>
              <div className="flex justify-between items-baseline mb-2">
                <span className="font-mono text-lg font-bold text-on-surface">₹{b.spent.toLocaleString("en-IN")}</span>
                <span className="font-mono text-xs text-on-surface-variant/60">/ ₹{b.budget.toLocaleString("en-IN")}</span>
              </div>
              <div className="w-full bg-surface-container-highest/30 rounded-full h-2 overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${over ? "bg-red-400" : b.color}`} style={{ width: `${pct}%` }} />
              </div>
              <div className="flex justify-between mt-2">
                <span className={`font-mono text-[10px] ${over ? "text-red-400" : "text-on-surface-variant/60"}`}>{pct}% used</span>
                {over && <span className="font-mono text-[10px] text-red-400">⚠ Over budget</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
