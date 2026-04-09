"use client";

import { useState, useRef, useEffect } from "react";
import { api } from "@/lib/api";

export default function AdvisorPage() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Welcome to your AI financial advisor. I have secure real-time access to your ledger. We can analyze spending patterns, find savings opportunities, or review budget limits. What would you like to know?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    
    const newMessages = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Send the prompt and history, excluding the initial welcome message from history payload if desired to save tokens,
      // but passing it is totally fine.
      const response = await api.post("/ai/chat", {
        prompt: userMessage,
        history: messages.filter(m => m.role !== "assistant" || messages.indexOf(m) !== 0) 
      });

      setMessages(prev => [...prev, { role: "assistant", content: response.data.data.answer }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "I experienced a secure network disruption while analyzing your ledger. Please try asking again." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (question) => {
    setInput(question);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 flex flex-col h-[calc(100vh-140px)]">
      <div className="shrink-0">
        <h2 className="font-headline text-3xl text-on-surface">AI Financial Advisor</h2>
        <p className="text-on-surface-variant/60 text-sm font-mono mt-1 uppercase tracking-widest">
          Context-aware AI utilizing encrypted ledger data
        </p>
      </div>

      {/* Chat Area */}
      <div className="glass-panel rounded-xl overflow-hidden shadow-2xl bg-[#0d0d1a] border border-outline-variant/10 flex flex-col flex-1">
        <div className="border-b border-[#F1F0EC]/10 px-8 py-5 flex items-center justify-between bg-[#12121f]/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-tr from-[#C9A84C] to-[#EFD781] rounded-full flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-[18px] text-[#0d0d1a]">auto_awesome</span>
            </div>
            <div>
              <p className="font-bold text-[#F1F0EC] text-sm">FinLedger AI Engine</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <p className="font-mono text-[10px] uppercase tracking-widest text-green-400">Gemini Secured</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Messages Container */}
        <div className="p-8 space-y-8 flex-1 overflow-y-auto no-scrollbar scroll-smooth">
          {messages.map((msg, index) => (
            <div key={index} className={`flex gap-4 max-w-2xl ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}>
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full border border-[#C9A84C]/50 flex-shrink-0 flex items-center justify-center mt-1 bg-[#1a1a28]">
                  <span className="material-symbols-outlined text-[14px] text-[#C9A84C]">auto_awesome</span>
                </div>
              )}
              
              <div className={`p-4 rounded-2xl ${
                msg.role === "user" 
                  ? "bg-[#C9A84C] text-[#0d0d1a] rounded-tr-sm shadow-[0_4px_14px_0_rgba(201,168,76,0.2)]" 
                  : "bg-[#1a1a28] text-[#F1F0EC] border border-[#F1F0EC]/10 rounded-tl-sm"
              }`}>
                <p className={`text-sm leading-relaxed whitespace-pre-wrap ${msg.role === "user" ? "font-medium" : ""}`}>
                  {msg.content}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4 max-w-2xl">
              <div className="w-8 h-8 rounded-full border border-[#C9A84C]/50 flex-shrink-0 flex items-center justify-center mt-1 bg-[#1a1a28]">
                <span className="material-symbols-outlined text-[14px] text-[#C9A84C] animate-spin">sync</span>
              </div>
              <div className="bg-[#1a1a28] border border-[#F1F0EC]/10 rounded-2xl rounded-tl-sm p-4 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#C9A84C] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-[#C9A84C] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-[#C9A84C] rounded-full animate-bounce"></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        {messages.length < 3 && (
          <div className="px-8 pb-4 flex gap-2 flex-wrap">
            {["Analyze my spending ratio", "Do I have any active budgets?", "What is my total liquidity?"].map((q) => (
              <button 
                key={q} 
                onClick={() => handleSuggestionClick(q)}
                className="bg-[#12121f] border border-[#F1F0EC]/10 px-4 py-2 rounded-full text-[11px] font-mono uppercase tracking-widest text-[#F1F0EC]/60 hover:border-[#C9A84C]/50 hover:text-[#C9A84C] transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSend} className="border-t border-[#F1F0EC]/10 px-8 py-5 flex gap-3 bg-[#12121f]/50 shrink-0">
          <input 
            className="flex-1 bg-[#1a1a28] border border-[#F1F0EC]/10 text-sm py-3.5 px-5 rounded-xl placeholder:text-[#F1F0EC]/30 text-[#F1F0EC] outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/50 transition-all shadow-inner" 
            placeholder="Interrogate your financial dataset..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-[#C9A84C] px-6 py-3.5 rounded-xl text-[#0d0d1a] disabled:opacity-50 hover:bg-[#d4b55b] flex items-center justify-center transition-all shadow-[0_4px_14px_0_rgba(201,168,76,0.39)] transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <span className="material-symbols-outlined text-[20px]">send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
