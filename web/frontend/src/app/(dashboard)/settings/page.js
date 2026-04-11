"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // "success" | "error" | null

  useEffect(() => {
    api.get("/auth/profile")
      .then(res => {
        const p = res.data.data;
        setName(p.name || "");
        setEmail(p.email || "");
        setCurrency(p.currencyPreference || "INR");
        setTimezone(p.timezone || "Asia/Kolkata");
      })
      .catch(err => {
        console.error("Failed to fetch profile:", err);
        // Fallback to auth context
        if (user) {
          setName(user.name || "");
          setEmail(user.email || "");
        }
      })
      .finally(() => setIsLoading(false));
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      await api.patch("/auth/profile", { name, currencyPreference: currency, timezone });
      setSaveStatus("success");
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      console.error("Failed to save:", err);
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="glass-panel p-24 flex flex-col items-center justify-center gap-4 rounded-xl shadow-2xl animate-in fade-in duration-500">
        <span className="material-symbols-outlined text-[32px] text-[#C9A84C] animate-spin">refresh</span>
        <p className="font-mono text-xs uppercase tracking-widest text-[#F1F0EC]/60">Loading Profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="font-headline text-3xl text-on-surface">Settings</h2>
        <p className="text-on-surface-variant/60 text-sm font-mono mt-1 uppercase tracking-widest">Profile, security, preferences, and data management</p>
      </div>

      {/* Save Status Banner */}
      {saveStatus === "success" && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-3 rounded-lg text-sm font-mono flex items-center gap-2 animate-in fade-in duration-200">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          Profile updated successfully
        </div>
      )}
      {saveStatus === "error" && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm font-mono flex items-center gap-2 animate-in fade-in duration-200">
          <span className="material-symbols-outlined text-[18px]">error</span>
          Failed to update profile
        </div>
      )}

      {/* Profile */}
      <div className="glass-panel rounded-xl p-8 border border-outline-variant/10 shadow-xl bg-[#0d0d1a]">
        <h3 className="font-headline text-xl text-on-surface mb-6">Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-[#F1F0EC]/60 mb-2">Full Name</label>
            <input
              className="w-full bg-[#12121f] border border-outline-variant/10 text-sm py-2.5 px-4 rounded-lg text-on-surface outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/50 transition-all"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-[#F1F0EC]/60 mb-2">Email</label>
            <input
              className="w-full bg-[#12121f] border border-outline-variant/10 text-sm py-2.5 px-4 rounded-lg text-[#F1F0EC]/40 outline-none cursor-not-allowed"
              value={email}
              disabled
            />
            <p className="font-mono text-[10px] text-[#F1F0EC]/30 mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-[#F1F0EC]/60 mb-2">Currency</label>
            <select
              className="w-full bg-[#12121f] border border-outline-variant/10 text-sm py-2.5 px-3 rounded-lg text-on-surface outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/50 transition-all"
              value={currency}
              onChange={e => setCurrency(e.target.value)}
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-[#F1F0EC]/60 mb-2">Timezone</label>
            <select
              className="w-full bg-[#12121f] border border-outline-variant/10 text-sm py-2.5 px-3 rounded-lg text-on-surface outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/50 transition-all"
              value={timezone}
              onChange={e => setTimezone(e.target.value)}
            >
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              <option value="America/New_York">America/New_York (EST)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
              <option value="Asia/Dubai">Asia/Dubai (GST)</option>
            </select>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="mt-6 bg-[#C9A84C] px-6 py-2.5 rounded-lg text-[#0d0d1a] font-bold text-sm hover:bg-[#d4b55b] disabled:opacity-50 transition-all flex items-center gap-2 shadow-[0_4px_14px_0_rgba(201,168,76,0.39)]"
        >
          {isSaving ? (
            <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
          ) : (
            <span className="material-symbols-outlined text-[16px]">save</span>
          )}
          Save Changes
        </button>
      </div>

      {/* Security */}
      <div className="glass-panel rounded-xl p-8 border border-outline-variant/10 shadow-xl bg-[#0d0d1a]">
        <h3 className="font-headline text-xl text-on-surface mb-6">Security</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-[#12121f] rounded-lg border border-outline-variant/10">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#C9A84C]">lock</span>
              <div>
                <p className="text-sm text-on-surface">Change Password</p>
                <p className="text-[10px] text-[#F1F0EC]/40 font-mono">Managed via authentication provider</p>
              </div>
            </div>
            <button className="border border-outline-variant/20 px-4 py-2 rounded-lg text-xs text-on-surface hover:border-[#C9A84C] transition-colors font-mono uppercase tracking-widest">Update</button>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="glass-panel rounded-xl p-8 border border-outline-variant/10 shadow-xl bg-[#0d0d1a]">
        <h3 className="font-headline text-xl text-on-surface mb-6">Data Management</h3>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={logout}
            className="border border-red-400/30 px-5 py-2.5 rounded-lg text-sm text-red-400 hover:border-red-400 transition-colors flex items-center gap-2 font-mono"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
