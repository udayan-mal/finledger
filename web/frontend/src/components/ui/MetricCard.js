export default function MetricCard({ label, value, suffix, trend, accentValue = false }) {
  const displayValue = () => {
    if (suffix === "currency") {
      const opts = value % 1 ? { minimumFractionDigits: 2, maximumFractionDigits: 2 } : undefined;
      return `₹${Number(value).toLocaleString("en-IN", opts)}`;
    }
    return value;
  };

  return (
    <div className="glass-panel p-6 rounded-xl border-t border-tertiary/20 transition-transform duration-200 hover:-translate-y-0.5">
      <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-2">
        {label}
      </p>
      <div className="flex items-baseline gap-2">
        <span
          className={`font-mono text-2xl font-bold ${accentValue ? "text-tertiary" : "text-on-surface"}`}
        >
          {displayValue()}
        </span>
        {suffix === "currency" && (
          <span className="font-mono text-[10px] text-on-surface-variant/40">INR</span>
        )}
        {suffix === "%" && (
          <span className="font-mono text-[10px] text-on-surface-variant/40">%</span>
        )}
        {trend !== undefined && trend > 0 && (
          <span className="material-symbols-outlined text-green-500 text-sm">trending_up</span>
        )}
        {trend !== undefined && trend < 0 && (
          <span className="material-symbols-outlined text-red-400 text-sm">trending_down</span>
        )}
      </div>
      {trend !== undefined && (
        <p className={`font-mono text-[10px] mt-1 ${trend >= 0 ? "text-green-400/60" : "text-red-400/60"}`}>
          {trend >= 0 ? "+" : ""}{trend}%
        </p>
      )}
    </div>
  );
}
