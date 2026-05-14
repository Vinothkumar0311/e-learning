import React from 'react';
import { Search, Bell, Moon, Sun, User, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

const Topbar = ({ darkMode, setDarkMode }) => {
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

        <button className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-primary/5 transition-all group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white overflow-hidden shadow-md">
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
              alt="Admin" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="hidden md:flex flex-col items-start leading-none">
            <span className="text-sm font-semibold">Vinoth Kumar</span>
            <span className="text-[10px] text-muted-foreground">Super Admin</span>
          </div>
          <ChevronDown size={14} className="text-muted-foreground group-hover:translate-y-0.5 transition-transform" />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
