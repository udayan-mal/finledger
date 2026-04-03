export default function AdvisorPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-headline text-3xl text-on-surface">AI Financial Advisor</h2>
        <p className="text-on-surface-variant/60 text-sm">Ask questions about spending, investments, and savings</p>
      </div>

      {/* Chat Area */}
      <div className="glass-panel rounded-xl overflow-hidden" style={{ minHeight: "500px" }}>
        <div className="border-b border-outline-variant/10 px-8 py-5 flex items-center gap-3">
          <div className="w-9 h-9 gold-sheen rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px] text-on-tertiary">auto_awesome</span>
          </div>
          <div>
            <p className="font-bold text-on-surface text-sm">FinLedger AI</p>
            <p className="font-mono text-[10px] text-green-400">● Online</p>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* AI Message */}
          <div className="flex gap-3 max-w-xl">
            <div className="w-8 h-8 gold-sheen rounded-full flex-shrink-0 flex items-center justify-center mt-1">
              <span className="material-symbols-outlined text-[14px] text-on-tertiary">auto_awesome</span>
            </div>
            <div className="bg-surface-container rounded-xl rounded-tl-sm p-4">
              <p className="text-sm text-on-surface leading-relaxed">Welcome to your AI financial advisor. I can help you analyze spending patterns, identify savings opportunities, and provide portfolio insights. What would you like to know?</p>
            </div>
          </div>

          {/* Suggestion Chips */}
          <div className="flex gap-2 flex-wrap ml-11">
            {["Where am I overspending?", "Stock portfolio return this year", "How to save ₹1 lakh by December?"].map((q) => (
              <button key={q} className="border border-outline-variant/20 px-4 py-2 rounded-lg text-xs text-on-surface-variant hover:border-tertiary hover:text-tertiary transition-colors">{q}</button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-outline-variant/10 px-8 py-4 flex gap-3">
          <input className="flex-1 bg-surface-container-low border border-outline-variant/20 text-sm py-3 px-4 rounded-lg placeholder:text-on-surface-variant/40 text-on-surface outline-none focus:ring-1 focus:ring-tertiary" placeholder="Ask about your finances..." />
          <button className="gold-sheen px-5 py-3 rounded-lg text-on-tertiary hover:scale-95 transition-transform">
            <span className="material-symbols-outlined text-[20px]">send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
