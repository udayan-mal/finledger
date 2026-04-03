"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", icon: "dashboard", label: "Dashboard" },
  { href: "/transactions", icon: "receipt_long", label: "Transactions" },
  { href: "/stocks", icon: "monitoring", label: "Stocks" },
  { href: "/mutual-funds", icon: "account_balance", label: "Mutual Funds" },
  { href: "/expenses", icon: "payments", label: "Expenses" },
  { href: "/budgets", icon: "account_balance_wallet", label: "Budgets" },
  { href: "/reports", icon: "query_stats", label: "Reports" },
  { href: "/net-worth", icon: "trending_up", label: "Net Worth" },
  { href: "/goals", icon: "savings", label: "Goals" },
  { href: "/accounts", icon: "credit_card", label: "Accounts" },
  { href: "/advisor", icon: "auto_awesome", label: "AI Advisor" },
  { href: "/recurring", icon: "event_repeat", label: "Recurring" }
];

const mobileNavItems = [
  { href: "/dashboard", icon: "dashboard", label: "Home" },
  { href: "/transactions", icon: "receipt_long", label: "History" },
  { href: "/mutual-funds", icon: "account_balance", label: "Funds" },
  { href: "/reports", icon: "query_stats", label: "Growth" },
  { href: "/settings", icon: "settings", label: "Menu" }
];

function NavLink({ item, pathname, onClick }) {
  const active = pathname === item.href;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`flex items-center gap-4 px-8 py-3.5 transition-all duration-300 ${
        active
          ? "text-[#C9A84C] border-r-2 border-[#C9A84C] bg-gradient-to-r from-[#C9A84C]/10 to-transparent translate-x-1"
          : "text-[#F1F0EC]/40 hover:text-[#F1F0EC] hover:bg-[#1a1a28]"
      }`}
    >
      <span
        className="material-symbols-outlined text-[20px]"
        style={
          active
            ? {
                fontVariationSettings:
                  "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"
              }
            : {}
        }
      >
        {item.icon}
      </span>
      <span className="font-mono text-xs uppercase tracking-widest">
        {item.label}
      </span>
    </Link>
  );
}

export default function AppShell({ children }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* ─── Desktop Sidebar ─── */}
      <aside className="hidden md:flex flex-col py-8 gap-y-6 h-screen w-72 left-0 top-0 fixed bg-[#0d0d1a] z-50">
        <div className="px-8 mb-4 flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="FinLedger"
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
            priority
          />
          <div>
            <h1 className="text-xl font-headline text-tertiary-container">
              FinLedger
            </h1>
            <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/60">
              Private Vault
            </p>
          </div>
        </div>

        <nav className="flex flex-col flex-grow overflow-y-auto no-scrollbar">
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ))}
          <div className="mt-auto">
            <NavLink
              item={{ href: "/settings", icon: "settings", label: "Settings" }}
              pathname={pathname}
            />
          </div>
        </nav>
      </aside>

      {/* ─── Mobile Drawer ─── */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="fixed left-0 top-0 z-50 flex h-screen w-72 flex-col bg-[#0d0d1a] py-5 md:hidden">
            <div className="mb-4 flex justify-between items-center px-8">
              <div className="flex items-center gap-3">
                <Image
                  src="/logo.png"
                  alt="FinLedger"
                  width={28}
                  height={28}
                  className="h-7 w-7 object-contain"
                />
                <h1 className="text-lg font-headline text-tertiary-container">
                  FinLedger
                </h1>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-on-surface-variant hover:text-tertiary transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <nav className="flex flex-col flex-grow overflow-y-auto">
              {navItems.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  pathname={pathname}
                  onClick={() => setMobileMenuOpen(false)}
                />
              ))}
              <div className="mt-auto">
                <NavLink
                  item={{
                    href: "/settings",
                    icon: "settings",
                    label: "Settings"
                  }}
                  pathname={pathname}
                  onClick={() => setMobileMenuOpen(false)}
                />
              </div>
            </nav>
          </aside>
        </>
      )}

      {/* ─── Main Canvas ─── */}
      <main className="md:ml-72 min-h-screen">
        {/* Top App Bar */}
        <header className="flex justify-between items-center w-full px-6 md:px-12 h-20 bg-[#12121f] sticky top-0 z-40 shadow-[0_32px_32px_0_rgba(13,13,26,0.08)]">
          <div className="flex items-center gap-8">
            <button
              className="md:hidden text-on-surface-variant hover:text-tertiary transition-colors"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <span className="text-2xl font-headline italic text-tertiary-container">
              FinLedger
            </span>
            <div className="hidden lg:flex relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant/40">
                search
              </span>
              <input
                className="bg-surface-container-low border-none focus:ring-1 focus:ring-tertiary text-sm py-2 pl-10 pr-4 w-64 rounded-lg placeholder:text-on-surface-variant/40 text-on-surface outline-none"
                placeholder="Search holdings..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button className="material-symbols-outlined text-on-surface-variant hover:text-tertiary transition-colors">
              notifications
            </button>
            <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant/30 bg-surface-container flex items-center justify-center">
              <span className="material-symbols-outlined text-on-surface-variant">
                person
              </span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6 md:p-12 max-w-7xl mx-auto space-y-12 pb-24 md:pb-12">
          {children}
        </div>

        {/* Footer */}
        <footer className="mt-24 px-6 md:px-12 py-12 border-t border-outline-variant/10 bg-[#0d0d1a]">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
              <h3 className="font-headline italic text-tertiary-container text-xl">
                FinLedger
              </h3>
              <p className="text-on-surface-variant/40 text-xs mt-2 font-mono uppercase tracking-[0.2em]">
                Institutional Grade Private Wealth Tracker
              </p>
            </div>
            <div className="flex gap-8 md:gap-12 text-[10px] font-mono uppercase tracking-widest text-on-surface-variant/60">
              <a
                className="hover:text-tertiary transition-colors"
                href="#"
              >
                Legal Disclosure
              </a>
              <a
                className="hover:text-tertiary transition-colors"
                href="#"
              >
                Privacy Policy
              </a>
              <a
                className="hover:text-tertiary transition-colors"
                href="#"
              >
                Security
              </a>
            </div>
          </div>
          <p className="text-center text-[10px] text-on-surface-variant/30 mt-12 font-mono">
            © 2024 FINLEDGER. ALL RIGHTS RESERVED. PURITY IN DATA.
          </p>
        </footer>
      </main>

      {/* ─── Mobile Bottom Nav ─── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1a1a28] h-16 flex items-center justify-around z-50">
        {mobileNavItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 ${
                active ? "text-[#C9A84C]" : "text-[#F1F0EC]/40"
              }`}
            >
              <span
                className="material-symbols-outlined text-xl"
                style={
                  active
                    ? { fontVariationSettings: "'FILL' 1" }
                    : {}
                }
              >
                {item.icon}
              </span>
              <span className="font-mono text-[8px] uppercase tracking-tighter">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
