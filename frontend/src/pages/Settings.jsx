import React from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Globe, 
  Mail, 
  CreditCard, 
  Save,
  Camera,
  Trash2,
  Lock
} from 'lucide-react';
import { cn } from '../lib/utils';

const Settings = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground mt-1">Configure your platform preferences and security.</p>
        </div>
        <button className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all font-bold shadow-lg shadow-primary/20">
          <Save size={18} />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          {[
            { label: 'Profile', icon: User, active: true },
            { label: 'General Settings', icon: SettingsIcon },
            { label: 'Notifications', icon: Bell },
            { label: 'Security', icon: Shield },
            { label: 'Branding', icon: Globe },
            { label: 'Payment Gateway', icon: CreditCard },
          ].map((item) => (
            <button 
              key={item.label}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                item.active ? "bg-primary text-white shadow-md shadow-primary/20" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-8">
          {/* Profile Section */}
          <div className="glass-card p-8 rounded-3xl space-y-8">
            <div className="flex items-center gap-8">
              <div className="relative group">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white overflow-hidden border-4 border-background shadow-xl">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Admin" />
                </div>
                <button className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-primary text-white shadow-lg scale-0 group-hover:scale-100 transition-transform">
                  <Camera size={14} />
                </button>
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold">Admin Profile</h3>
                <p className="text-sm text-muted-foreground">Manage your personal information and presence.</p>
                <div className="flex items-center gap-2 pt-2">
                  <button className="px-3 py-1 rounded-lg border border-border text-[10px] font-bold uppercase tracking-wider hover:bg-muted transition-all">Change Photo</button>
                  <button className="px-3 py-1 rounded-lg border border-red-500/30 text-red-500 text-[10px] font-bold uppercase tracking-wider hover:bg-red-500/10 transition-all">Remove</button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                <input 
                  type="text" 
                  defaultValue="Vinoth Kumar"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
                <input 
                  type="email" 
                  defaultValue="admin@eduadmin.com"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Phone Number</label>
                <input 
                  type="tel" 
                  defaultValue="+1 (555) 000-1234"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Admin Role</label>
                <select className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-not-allowed" disabled>
                  <option>Super Admin</option>
                  <option>Content Manager</option>
                  <option>Support Agent</option>
                </select>
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="glass-card p-8 rounded-3xl space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Shield size={20} className="text-primary" />
              Security Settings
            </h3>
            <div className="divide-y divide-white/5">
              {[
                { title: 'Two-Factor Authentication', desc: 'Secure your account with 2FA verification.', enabled: true },
                { title: 'Login Notifications', desc: 'Get alerted whenever someone logs into your account.', enabled: true },
                { title: 'API Access', desc: 'Enable external integrations via API keys.', enabled: false },
              ].map((item) => (
                <div key={item.title} className="py-4 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm">{item.title}</div>
                    <div className="text-xs text-muted-foreground">{item.desc}</div>
                  </div>
                  <div className={cn(
                    "w-12 h-6 rounded-full p-1 cursor-pointer transition-all",
                    item.enabled ? "bg-primary" : "bg-muted"
                  )}>
                    <div className={cn(
                      "w-4 h-4 bg-white rounded-full shadow-sm transition-all",
                      item.enabled ? "translate-x-6" : "translate-x-0"
                    )}></div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="pt-4">
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-muted transition-all text-sm font-medium">
                <Lock size={16} />
                Change Password
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-red-500 text-sm">Danger Zone</h4>
              <p className="text-xs text-muted-foreground">Permanently delete this account and all associated data.</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-all text-sm font-bold shadow-lg shadow-red-500/20">
              <Trash2 size={16} />
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
