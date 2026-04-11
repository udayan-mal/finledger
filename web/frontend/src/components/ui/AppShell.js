"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import AddEntryModal from "./AddEntryModal";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

const navGroups = [
  {
    title: "Overview",
    items: [
      { href: "/dashboard", icon: "dashboard", label: "Dashboard" },
      { href: "/net-worth", icon: "trending_up", label: "Net Worth" }
    ]
  },
  {
    title: "Transactions",
    items: [
      { href: "/transactions", icon: "receipt_long", label: "All Transactions" }
    ]
  },
  {
    title: "Investments",
    items: [
      { href: "/stocks", icon: "monitoring", label: "Stock Market" },
      { href: "/mutual-funds", icon: "account_balance", label: "Mutual Funds" }
    ]
  },
  {
    title: "Expenses",
    items: [
      { href: "/expenses", icon: "payments", label: "Expenses" },
      { href: "/budgets", icon: "account_balance_wallet", label: "Budget Planner" },
      { href: "/recurring", icon: "event_repeat", label: "Recurring" }
    ]
  },
  {
    title: "Insights",
    items: [
      { href: "/reports", icon: "query_stats", label: "Reports" },
      { href: "/advisor", icon: "auto_awesome", label: "AI Advisor" }
    ]
  },
  {
    title: "Assets & Planning",
    items: [
      { href: "/accounts", icon: "credit_card", label: "Accounts" },
      { href: "/goals", icon: "savings", label: "Goals & Savings" }
    ]
  }
];

const mobileNavItems = [
  { href: "/dashboard", icon: "dashboard", label: "Home" },
  { href: "/transactions", icon: "receipt_long", label: "History" },
  { href: "/mutual-funds", icon: "account_balance", label: "Funds" },
  { href: "/reports", icon: "query_stats", label: "Growth" },
  { href: "/settings", icon: "settings", label: "Menu" }
];

// ──────────────────────────────────────────────
// Animated Hamburger Component
// ──────────────────────────────────────────────
function AnimatedHamburger({ isOpen, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`relative w-10 h-10 flex flex-col justify-center items-center group transition-colors rounded-full hover:bg-surface-container-highest/50 ${className}`}
      aria-label="Toggle menu"
    >
      <span
        className={`block h-[2px] w-5 bg-current rounded-full transition-all duration-300 ease-in-out ${
          isOpen ? "rotate-45 translate-y-[6px]" : "-translate-y-[5px]"
        }`}
      />
      <span
        className={`block h-[2px] w-5 bg-current rounded-full transition-all duration-200 ease-in-out ${
          isOpen ? "opacity-0" : "opacity-100"
        }`}
      />
      <span
        className={`block h-[2px] w-5 bg-current rounded-full transition-all duration-300 ease-in-out ${
          isOpen ? "-rotate-45 -translate-y-[6px]" : "translate-y-[5px]"
        }`}
      />
    </button>
  );
}

// ──────────────────────────────────────────────
// NavLink Component
// ──────────────────────────────────────────────
function NavLink({ item, pathname, onClick, isExpanded = true }) {
  const active = pathname === item.href;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`group flex items-center py-2.5 transition-all duration-300 ${
        isExpanded ? "px-8 gap-4" : "justify-center px-0 gap-0 relative"
      } ${
        active
          ? "text-[#C9A84C] relative before:absolute before:inset-y-0 before:right-0 before:w-[2px] before:bg-tertiary bg-gradient-to-r from-transparent to-[#C9A84C]/10"
          : "text-[#F1F0EC]/40 hover:text-[#F1F0EC] hover:bg-[#1a1a28]"
      }`}
    >
      <span
        className={`material-symbols-outlined transition-all duration-300 ${
          isExpanded ? "text-[20px]" : "text-[22px]"
        }`}
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

      {/* Label - fades out and shrinks width when collapsed */}
      <span
        className={`font-mono text-xs uppercase tracking-widest whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? "opacity-100 max-w-[150px] ml-0" : "opacity-0 max-w-0 ml-0 hidden md:block" 
        }`}
      >
        {item.label}
      </span>

      {/* Tooltip for mini-sidebar mode (visible on hover when collapsed) */}
      {!isExpanded && (
        <div className="absolute left-16 bg-[#1a1a28] text-[#F1F0EC] px-3 py-1.5 rounded-md font-mono text-[10px] uppercase tracking-widest opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 z-50 whitespace-nowrap shadow-xl border border-outline-variant/10">
          {item.label}
        </div>
      )}
    </Link>
  );
}

// ──────────────────────────────────────────────
// Financial Health Widget
// ──────────────────────────────────────────────
function FinancialHealthWidget({ isExpanded }) {
  const [score, setScore] = useState("--");
  const [status, setStatus] = useState("COMPUTING");
  const [colorText, setColorText] = useState("text-on-surface-variant/60");
  const [colorBg, setColorBg] = useState("");

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await api.get("/dashboard/summary");
        const m = res.data.data?.metrics || {};
        
        let calculatedScore = 50; // Base score
        if (m.netWorthPaise > 0) calculatedScore += 10;
        if (parseFloat(m.savingsRatePercent) > 20) calculatedScore += 20;
        else if (parseFloat(m.savingsRatePercent) > 0) calculatedScore += 10;
        if (m.bankCashPaise > 10000000) calculatedScore += 20; // > ₹1 Lakh cash buffer
        
        calculatedScore = Math.min(100, Math.max(0, calculatedScore));
        
        setScore(calculatedScore);
        if (calculatedScore >= 80) {
          setStatus("EXCELLENT");
          setColorText("text-green-400");
          setColorBg("bg-green-500/10");
        } else if (calculatedScore >= 60) {
          setStatus("GOOD STANDING");
          setColorText("text-blue-400");
          setColorBg("bg-blue-500/10");
        } else {
          setStatus("NEEDS FOCUS");
          setColorText("text-yellow-400");
          setColorBg("bg-yellow-500/10");
        }
      } catch (err) {
        setScore("--");
        setStatus("NO DATA");
        setColorText("text-on-surface-variant/40");
      }
    };
    fetchHealth();
  }, []);

  return (
    <div className={`mt-auto transition-all duration-300 mb-2 ${isExpanded ? "px-6" : "px-0 flex justify-center"}`}>
      <div 
        className={`relative overflow-hidden rounded-xl border border-tertiary/20 group transition-all duration-300 ${
          isExpanded 
            ? "p-4 bg-gradient-to-br from-[#C9A84C]/5 to-transparent w-full" 
            : "p-2 w-10 bg-surface-container flex flex-col items-center cursor-pointer hover:bg-surface-container-highest"
        }`}
      >
        {/* Subtle background glow effect based on score status */}
        {isExpanded && colorBg && (
          <div className={`absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl pointer-events-none ${colorBg}`} />
        )}

        <div className={`flex items-center ${isExpanded ? "gap-3" : "justify-center"}`}>
          <div className={`flex items-center justify-center flex-shrink-0 rounded-lg ${isExpanded ? "w-10 h-10 bg-surface-container border border-outline-variant/20" : "w-6 h-6"}`}>
            <span className={`material-symbols-outlined transition-colors duration-300 ${isExpanded ? "text-tertiary text-xl" : "text-tertiary group-hover:text-tertiary-container"}`}>
              verified_user
            </span>
          </div>
          
          {/* Detailed text (only shown when expanded) */}
          <div 
            className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${
              isExpanded ? "opacity-100 max-w-full w-auto block" : "opacity-0 w-0 max-w-0 hidden md:hidden"
            }`}
          >
            <p className="font-mono text-[9px] uppercase tracking-widest text-on-surface-variant/60 mb-0.5">
              Financial Health
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="font-headline text-xl text-on-surface font-bold leading-none">{score}</span>
              <span className={`text-[10px] uppercase font-mono tracking-wider font-bold ${colorText}`}>{status}</span>
            </div>
          </div>
        </div>

        {/* Tooltip for mini mode */}
        {!isExpanded && (
          <div className="absolute left-16 bg-[#1a1a28] text-[#F1F0EC] px-3 py-1.5 rounded-md font-mono text-[10px] uppercase tracking-widest opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 z-50 whitespace-nowrap shadow-xl border border-outline-variant/10">
            Health: {score} ({status})
          </div>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// AppShell Component
// ──────────────────────────────────────────────
export default function AppShell({ children }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { logout, user } = useAuth();
  
  // Controls desktop sidebar expanded/mini state
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  // Controls Global Quick Add Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Controls Notifications Dropdown
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <>
      {/* ─── Desktop Sidebar ─── */}
      <aside 
        className={`hidden md:flex flex-col py-6 gap-y-2 h-screen left-0 top-0 fixed bg-[#0d0d1a] z-50 transition-all duration-300 ease-in-out shadow-2xl overflow-hidden ${
          isSidebarExpanded ? "w-72" : "w-20"
        }`}
      >
        <div 
          className={`flex items-center mb-6 transition-all duration-300 h-10 ${
            isSidebarExpanded ? "px-8 gap-3" : "px-0 justify-center flex-col gap-0"
          }`}
        >
          <Image
            src="/logo.png"
            alt="FinLedger"
            width={isSidebarExpanded ? 36 : 32}
            height={isSidebarExpanded ? 36 : 32}
            className={`object-contain transition-all duration-300 flex-shrink-0 ${
              isSidebarExpanded ? "h-9 w-9" : "h-8 w-8"
            }`}
            priority
          />
          <div 
            className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${
              isSidebarExpanded ? "opacity-100 w-auto" : "opacity-0 w-0 h-0 hidden"
            }`}
          >
            <h1 className="text-xl font-headline text-tertiary-container">
              FinLedger
            </h1>
            <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/60">
              Private Vault
            </p>
          </div>
        </div>

        <nav className="flex flex-col flex-grow overflow-y-auto no-scrollbar pb-6 gap-6">
          <div className="flex flex-col gap-y-5">
            {navGroups.map((group, groupIdx) => (
              <div key={groupIdx} className="flex flex-col gap-1.5">
                {/* Group Title */}
                <div 
                  className={`transition-all duration-300 overflow-hidden ${
                    isSidebarExpanded ? "opacity-100 max-h-10 px-8" : "opacity-0 max-h-0 px-0 m-0"
                  }`}
                >
                  <p className="font-mono text-[9px] uppercase tracking-widest text-on-surface-variant/40 mt-1">
                    {group.title}
                  </p>
                </div>
                {/* Group Items */}
                <div className="flex flex-col gap-0.5">
                  {group.items.map((item) => (
                    <NavLink 
                      key={item.href} 
                      item={item} 
                      pathname={pathname} 
                      isExpanded={isSidebarExpanded} 
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <FinancialHealthWidget isExpanded={isSidebarExpanded} />

          {/* User Profile Section with Logout */}
          <div className={`p-4 mt-auto border-t border-[#F1F0EC]/10 transition-all duration-300 ${isSidebarExpanded ? "opacity-100" : "opacity-0 invisible"}`}>
            <div className="flex items-center gap-3 w-full group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#C9A84C] to-[#EFD781] flex items-center justify-center text-[#0d0d1a] font-bold shadow-lg shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="flex-1 w-0 min-w-0">
                <p className="text-sm font-bold text-on-surface truncate">{user?.name || "System Admin"}</p>
                <p className="text-xs text-on-surface-variant truncate">{user?.email || "vault@finledger.internal"}</p>
              </div>
              <button 
                onClick={logout}
                className="w-10 h-10 shrink-0 text-on-surface-variant flex items-center justify-center rounded-lg hover:bg-surface-container hover:text-red-400 transition-colors"
                title="Logout"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
              </button>
            </div>
          </div>

          <div className={`mt-0 border-t border-outline-variant/10 pt-4 ${isSidebarExpanded ? "px-4" : "px-0"}`}>
             <NavLink
                item={{ href: "/settings", icon: "settings", label: "Settings" }}
                pathname={pathname}
                isExpanded={isSidebarExpanded}
              />
          </div>
        </nav>
      </aside>

      {/* ─── Mobile Drawer ─── */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 md:hidden backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="fixed left-0 top-0 z-50 flex h-screen w-[85%] max-w-[320px] flex-col bg-[#0d0d1a] py-5 md:hidden shadow-2xl animate-in slide-in-from-left">
            <div className="mb-4 flex justify-between items-center px-8 border-b border-outline-variant/10 pb-4">
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
            <nav className="flex flex-col flex-grow overflow-y-auto no-scrollbar pt-2 gap-4 pb-6">
              <div className="flex flex-col gap-y-4">
                {navGroups.map((group, groupIdx) => (
                  <div key={groupIdx} className="flex flex-col gap-1">
                    <p className="font-mono text-[9px] uppercase tracking-widest text-on-surface-variant/40 px-8 py-1">
                      {group.title}
                    </p>
                    <div className="flex flex-col">
                      {group.items.map((item) => (
                        <NavLink
                          key={item.href}
                          item={item}
                          pathname={pathname}
                          onClick={() => setMobileMenuOpen(false)}
                          isExpanded={true}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <FinancialHealthWidget isExpanded={true} />

              <div className="mt-0 border-t border-outline-variant/10 pt-4 px-4">
                <NavLink
                  item={{
                    href: "/settings",
                    icon: "settings",
                    label: "Settings"
                  }}
                  pathname={pathname}
                  onClick={() => setMobileMenuOpen(false)}
                  isExpanded={true}
                />
              </div>
            </nav>
          </aside>
        </>
      )}

      {/* ─── Main Canvas ─── */}
      <main 
        className={`min-h-screen transition-all duration-300 ease-in-out ${
          isSidebarExpanded ? "md:ml-72" : "md:ml-20"
        }`}
      >
        {/* Top App Bar */}
        <header className="flex justify-between items-center w-full px-6 md:px-12 h-20 bg-[#12121f] sticky top-0 z-30 shadow-[0_32px_32px_0_rgba(13,13,26,0.08)]">
          <div className="flex items-center gap-2 md:gap-6">
            
            {/* Mobile Nav Toggle */}
            <div className="md:hidden">
              <AnimatedHamburger 
                isOpen={mobileMenuOpen} 
                onClick={() => setMobileMenuOpen(true)} 
                className="text-on-surface-variant hover:text-tertiary"
              />
            </div>

            {/* Desktop Sidebar Toggle */}
            <div className="hidden md:flex">
              <AnimatedHamburger 
                isOpen={isSidebarExpanded} 
                onClick={() => setIsSidebarExpanded(!isSidebarExpanded)} 
                className="text-on-surface-variant hover:text-tertiary"
              />
            </div>

            <span className="text-2xl font-headline italic text-tertiary-container ml-2 md:ml-0">
              FinLedger
            </span>
            <div className="hidden lg:flex relative ml-4">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant/40">
                search
              </span>
              <input
                className="bg-surface-container-low/50 border border-outline-variant/10 focus:border-tertiary/50 focus:ring-1 focus:ring-tertiary/50 text-sm py-2 pl-10 pr-4 w-72 rounded-lg placeholder:text-on-surface-variant/30 text-on-surface outline-none transition-all"
                placeholder="Search holdings..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 md:gap-6">
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-[#C9A84C] text-[#0d0d1a] hover:bg-[#d4b55b] rounded-lg font-mono text-xs uppercase tracking-widest font-bold shadow-[0_4px_14px_0_rgba(201,168,76,0.39)] transition-all transform hover:-translate-y-0.5"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Quick Add
            </button>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="md:hidden text-[#C9A84C] hover:text-[#d4b55b] transition-colors w-10 h-10 flex items-center justify-center bg-[#C9A84C]/10 rounded-full"
            >
               <span className="material-symbols-outlined text-[20px]">add</span>
            </button>

            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                onBlur={() => setTimeout(() => setShowNotifications(false), 200)}
                className="relative material-symbols-outlined text-on-surface-variant hover:text-tertiary transition-colors"
              >
                notifications
                {/* Notification dot */}
                <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-tertiary rounded-full border border-[#12121f]"></span>
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-64 bg-[#1a1a28] border border-outline-variant/10 rounded-xl shadow-2xl py-3 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-outline-variant/5 mb-1">
                    <p className="font-headline text-sm text-on-surface">Notifications</p>
                  </div>
                  <div className="px-4 py-6 text-center">
                    <span className="material-symbols-outlined text-on-surface-variant/30 text-3xl mb-2">notifications_off</span>
                    <p className="text-xs text-[#F1F0EC]/40 font-mono">You're all caught up!</p>
                  </div>
                </div>
              )}
            </div>
            <Link 
              href="/settings"
              className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant/30 bg-surface-container flex items-center justify-center cursor-pointer hover:border-tertiary/50 hover:bg-surface-container-highest transition-colors group"
            >
              {user?.name ? (
                <span className="font-bold text-on-surface-variant group-hover:text-tertiary text-sm">{user.name.charAt(0).toUpperCase()}</span>
              ) : (
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-tertiary">
                  person
                </span>
              )}
            </Link>
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1a1a28]/95 backdrop-blur-md h-16 flex items-center justify-around z-50 border-t border-outline-variant/10">
        {mobileNavItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 transition-all ${
                active ? "text-[#C9A84C] -translate-y-1" : "text-[#F1F0EC]/40 hover:text-[#F1F0EC]/80"
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

      <AddEntryModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => window.location.reload()} // Quick hack to refresh data for MVP
      />
    </>
  );
}
