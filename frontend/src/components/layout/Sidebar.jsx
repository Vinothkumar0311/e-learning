import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  UserPlus,
  ClipboardList, 
  CreditCard, 
  Video, 
  FileText, 
  Bell, 
  BarChart3,
  BarChart2, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Courses', icon: BookOpen, path: '/courses' },
  { name: 'Students', icon: Users, path: '/students' },
  { name: 'Performance', icon: BarChart2, path: '/performance' },
  { name: 'Admissions', icon: UserPlus, path: '/admissions' },
  // { name: 'Enrollment Requests', icon: ClipboardList, path: '/enrollments' },
  // { name: 'Verify Payments', icon: CreditCard, path: '/verify-payments' },
  // { name: 'Payments', icon: CreditCard, path: '/payments' },
  { name: 'Live Classes', icon: Video, path: '/live-classes' },
  { name: 'Materials', icon: FileText, path: '/materials' },
  { name: 'Notifications', icon: Bell, path: '/notifications' },
  { name: 'Reports', icon: BarChart3, path: '/reports' },
  { name: 'Settings', icon: Settings, path: '/settings' },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.div
      animate={{ width: collapsed ? 80 : 260 }}
      className={cn(
        "glass-sidebar fixed left-0 top-0 h-screen z-50 flex flex-col transition-all duration-300",
        collapsed ? "items-center" : "items-stretch"
      )}
    >
      <div className="p-6 flex items-center justify-between">
        {!collapsed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <GraduationCap className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              EduAdmin
            </span>
          </motion.div>
        )}
        {collapsed && (
           <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
             <GraduationCap className="text-white w-6 h-6" />
           </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground transition-colors absolute -right-3 top-20 bg-background border border-border shadow-sm"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-1 mt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
              isActive 
                ? "bg-primary text-white shadow-lg shadow-primary/30" 
                : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
            )}
          >
            <item.icon size={collapsed ? 24 : 20} className={cn(
              "transition-transform group-hover:scale-110",
              collapsed ? "mx-auto" : ""
            )} />
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="font-medium whitespace-nowrap"
              >
                {item.name}
              </motion.span>
            )}
            {collapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-md z-[100] whitespace-nowrap border border-border">
                {item.name}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button className={cn(
          "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-500/10 transition-all group",
          collapsed ? "justify-center" : ""
        )}>
          <LogOut size={collapsed ? 24 : 20} className="group-hover:translate-x-1 transition-transform" />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;
