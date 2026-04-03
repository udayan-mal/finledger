"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AppShell from "@/components/ui/AppShell";

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Prevent flashing the dashboard UI while checking authentication
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-[48px] text-[#C9A84C] animate-spin">sync</span>
          <p className="font-mono text-xs uppercase tracking-widest text-[#F1F0EC]/40">Decrypting session vault...</p>
        </div>
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
