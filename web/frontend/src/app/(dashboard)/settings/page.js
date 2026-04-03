export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-headline text-3xl text-on-surface">Settings</h2>
        <p className="text-on-surface-variant/60 text-sm">Profile, security, preferences, and data management</p>
      </div>

      {/* Profile */}
      <div className="glass-panel rounded-xl p-8 border-t border-tertiary/20">
        <h3 className="font-headline text-xl text-on-surface mb-6">Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-2">Full Name</label>
            <input className="w-full bg-surface-container-low border border-outline-variant/20 text-sm py-2.5 px-4 rounded-lg text-on-surface outline-none focus:ring-1 focus:ring-tertiary" defaultValue="Sovereign User" />
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-2">Email</label>
            <input className="w-full bg-surface-container-low border border-outline-variant/20 text-sm py-2.5 px-4 rounded-lg text-on-surface outline-none focus:ring-1 focus:ring-tertiary" defaultValue="sovereign@finledger.app" />
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-2">Currency</label>
            <select className="w-full bg-surface-container-low border border-outline-variant/20 text-sm py-2.5 px-3 rounded-lg text-on-surface outline-none focus:ring-1 focus:ring-tertiary">
              <option>INR (₹)</option>
              <option>USD ($)</option>
              <option>EUR (€)</option>
            </select>
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-2">Timezone</label>
            <select className="w-full bg-surface-container-low border border-outline-variant/20 text-sm py-2.5 px-3 rounded-lg text-on-surface outline-none focus:ring-1 focus:ring-tertiary">
              <option>Asia/Kolkata (IST)</option>
              <option>America/New_York (EST)</option>
              <option>Europe/London (GMT)</option>
            </select>
          </div>
        </div>
        <button className="gold-sheen mt-6 px-6 py-2.5 rounded-md text-on-tertiary font-bold text-sm hover:scale-95 transition-transform">Save Changes</button>
      </div>

      {/* Security */}
      <div className="glass-panel rounded-xl p-8">
        <h3 className="font-headline text-xl text-on-surface mb-6">Security</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-surface-container/50 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-tertiary">lock</span>
              <div>
                <p className="text-sm text-on-surface">Change Password</p>
                <p className="text-[10px] text-on-surface-variant/60">Last changed 30 days ago</p>
              </div>
            </div>
            <button className="border border-outline-variant/30 px-4 py-2 rounded-lg text-xs text-on-surface hover:border-tertiary transition-colors">Update</button>
          </div>
          <div className="flex items-center justify-between p-4 bg-surface-container/50 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-tertiary">fingerprint</span>
              <div>
                <p className="text-sm text-on-surface">Two-Factor Authentication</p>
                <p className="text-[10px] text-on-surface-variant/60">Not enabled</p>
              </div>
            </div>
            <button className="border border-outline-variant/30 px-4 py-2 rounded-lg text-xs text-on-surface hover:border-tertiary transition-colors">Enable</button>
          </div>
        </div>
      </div>

      {/* Data */}
      <div className="glass-panel rounded-xl p-8">
        <h3 className="font-headline text-xl text-on-surface mb-6">Data Management</h3>
        <div className="flex gap-3 flex-wrap">
          <button className="border border-outline-variant/30 px-5 py-2.5 rounded-lg text-sm text-on-surface hover:border-tertiary transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">download</span> Export All Data
          </button>
          <button className="border border-outline-variant/30 px-5 py-2.5 rounded-lg text-sm text-on-surface hover:border-tertiary transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">upload</span> Import CSV
          </button>
          <button className="border border-red-400/30 px-5 py-2.5 rounded-lg text-sm text-red-400 hover:border-red-400 transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">delete</span> Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
