import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Moon, Sun, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

const Topbar = ({ darkMode, setDarkMode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="glass-topbar sticky top-0 z-40 w-full h-16 flex items-center justify-between px-8">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search students, courses, transactions..."
            className="w-full bg-background/50 border border-border rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all active:scale-90"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="relative group">
          <button className="p-2 rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background"></span>
          </button>
        </div>

        <div className="h-8 w-px bg-border mx-2"></div>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-primary/5 transition-all group"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold text-sm shadow-md">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="hidden md:flex flex-col items-start leading-none">
              <span className="text-sm font-semibold">{user?.name || 'Admin'}</span>
              <span className="text-[10px] text-muted-foreground capitalize">{user?.role?.replace('_', ' ') || 'Admin'}</span>
            </div>
            <ChevronDown
              size={14}
              className={`text-muted-foreground transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 glass-card rounded-2xl shadow-xl border border-white/10 py-2 z-50">
              <div className="px-4 py-3 border-b border-white/5">
                <p className="text-sm font-bold">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => { setDropdownOpen(false); navigate('/settings'); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-primary/5 transition-colors text-sm"
              >
                <Settings size={15} className="text-muted-foreground" />
                Settings
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-500/10 text-red-500 transition-colors text-sm"
              >
                <LogOut size={15} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
