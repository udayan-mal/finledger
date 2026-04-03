"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Vault password must be at least 8 characters long for security.");
      return;
    }

    setIsLoading(true);
    setError("");

    const result = await register(name, email, password);
    if (!result.success) {
      setError(result.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#C9A84C]/5 rounded-full blur-3xl opacity-50 mix-blend-screen animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-tertiary-container/5 rounded-full blur-3xl opacity-50 mix-blend-screen animate-pulse animation-delay-2000"></div>
      </div>

      <div className="w-full max-w-md bg-[#12121f]/90 backdrop-blur-xl rounded-2xl border border-outline-variant/10 shadow-2xl p-8 relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/logo.png"
            alt="FinLedger"
            width={48}
            height={48}
            className="h-12 w-12 object-contain mb-4"
          />
          <h1 className="text-3xl font-headline text-[#C9A84C] italic">FinLedger</h1>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/40 mt-2 text-center">
            Initialize Wealth Private Ledger
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 font-mono text-xs p-3 rounded-lg flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-[16px]">error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-[#F1F0EC]/60 mb-2">
              Full Legal Name
            </label>
            <input
              type="text"
              className="w-full bg-[#1a1a28] border border-[#F1F0EC]/10 focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/50 text-sm py-3 px-4 rounded-lg placeholder:text-[#F1F0EC]/20 text-[#F1F0EC] outline-none transition-all shadow-inner"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-[#F1F0EC]/60 mb-2">
              Corporate / Personal Email
            </label>
            <input
              type="email"
              className="w-full bg-[#1a1a28] border border-[#F1F0EC]/10 focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/50 text-sm py-3 px-4 rounded-lg placeholder:text-[#F1F0EC]/20 text-[#F1F0EC] outline-none transition-all shadow-inner"
              placeholder="name@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-[#F1F0EC]/60 mb-2">
              Cryptographic Master Password
            </label>
            <input
              type="password"
              className="w-full bg-[#1a1a28] border border-[#F1F0EC]/10 focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/50 text-sm py-3 px-4 rounded-lg placeholder:text-[#F1F0EC]/20 text-[#F1F0EC] outline-none transition-all shadow-inner"
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-surface-container-highest text-[#F1F0EC] border border-[#C9A84C]/30 py-3 rounded-lg font-mono text-xs uppercase tracking-widest font-bold hover:bg-[#C9A84C] hover:text-[#0d0d1a] hover:border-[#C9A84C] transition-all flex items-center justify-center gap-2 shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
            ) : (
              <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
            )}
            Establish Connection
          </button>
        </form>

        <div className="mt-8 text-center border-t border-[#F1F0EC]/5 pt-6">
          <p className="font-mono text-[10px] text-[#F1F0EC]/40 uppercase tracking-wider">
            Already have an active vault?{" "}
            <Link href="/login" className="text-[#C9A84C] hover:text-[#d4b55b] font-bold underline decoration-[#C9A84C]/30 underline-offset-4">
              Return to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
