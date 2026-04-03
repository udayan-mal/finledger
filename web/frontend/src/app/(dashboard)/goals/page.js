export default function GoalsPage() {
  const goals = [
    { id: "1", name: "Vacation Fund", icon: "flight", target: 100000, current: 62000, deadline: "Dec 2024", color: "bg-tertiary" },
    { id: "2", name: "Emergency Fund", icon: "shield", target: 300000, current: 180000, deadline: "Mar 2025", color: "bg-green-400" },
    { id: "3", name: "New Laptop", icon: "laptop_mac", target: 80000, current: 80000, deadline: "Completed", color: "bg-blue-400" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline text-3xl text-on-surface">Goals & Savings</h2>
          <p className="text-on-surface-variant/60 text-sm">Track progress toward your financial milestones</p>
        </div>
        <button className="gold-sheen px-6 py-2 rounded-md text-on-tertiary font-bold text-sm hover:scale-95 transition-transform">NEW GOAL</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {goals.map((g) => {
          const pct = Math.min(100, Math.round((g.current / g.target) * 100));
          const done = pct >= 100;
          return (
            <div key={g.id} className="glass-panel p-6 rounded-xl border-t border-tertiary/20 hover:-translate-y-0.5 transition-transform">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-surface-container flex items-center justify-center rounded-lg border border-outline-variant/20">
                  <span className="material-symbols-outlined text-tertiary">{g.icon}</span>
                </div>
                <div>
                  <p className="font-bold text-on-surface">{g.name}</p>
                  <p className="font-mono text-[10px] text-on-surface-variant/60">{g.deadline}</p>
                </div>
              </div>
              <div className="flex justify-between items-baseline mb-2">
                <span className="font-mono text-lg font-bold text-on-surface">₹{g.current.toLocaleString("en-IN")}</span>
                <span className="font-mono text-xs text-on-surface-variant/60">/ ₹{g.target.toLocaleString("en-IN")}</span>
              </div>
              <div className="w-full bg-surface-container-highest/30 rounded-full h-2.5 overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${done ? "bg-green-400" : g.color}`} style={{ width: `${pct}%` }} />
              </div>
              <p className={`font-mono text-[10px] mt-2 ${done ? "text-green-400" : "text-on-surface-variant/60"}`}>
                {done ? "✓ Goal achieved!" : `${pct}% complete`}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
