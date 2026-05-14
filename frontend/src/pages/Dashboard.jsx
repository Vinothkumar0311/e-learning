import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  BookOpen, 
  Clock,
  ArrowRight,
  PlayCircle,
  FileText,
  Plus
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { dashboardStats, recentEnrollments, upcomingClasses } from '../data/mockData';
import { cn } from '../lib/utils';

const data = [
  { name: 'Jan', revenue: 4000, students: 2400 },
  { name: 'Feb', revenue: 3000, students: 1398 },
  { name: 'Mar', revenue: 2000, students: 9800 },
  { name: 'Apr', revenue: 2780, students: 3908 },
  { name: 'May', revenue: 1890, students: 4800 },
  { name: 'Jun', revenue: 2390, students: 3800 },
  { name: 'Jul', revenue: 3490, students: 4300 },
];

const Dashboard = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">Welcome back, here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/50 dark:bg-white/5 border border-border hover:bg-white dark:hover:bg-white/10 transition-all text-sm font-medium">
            <FileText size={18} />
            Export Report
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all text-sm font-medium shadow-lg shadow-primary/20">
            <Plus size={18} />
            Create New Course
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 rounded-2xl group hover:scale-[1.02] transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{stat.title}</span>
              <div className={cn(
                "p-2 rounded-lg bg-background/50 border border-border group-hover:bg-primary/10 group-hover:text-primary transition-colors",
                stat.title === "Total Revenue" ? "text-green-500" : 
                stat.title === "Total Students" ? "text-blue-500" :
                stat.title === "Active Courses" ? "text-purple-500" : "text-orange-500"
              )}>
                {stat.title === "Total Revenue" ? <DollarSign size={18} /> : 
                 stat.title === "Total Students" ? <Users size={18} /> :
                 stat.title === "Active Courses" ? <BookOpen size={18} /> : <Clock size={18} />}
              </div>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <h3 className="text-2xl font-bold">{stat.value}</h3>
                <div className={cn(
                  "flex items-center gap-1 text-xs mt-1 font-medium",
                  stat.isPositive ? "text-green-500" : "text-red-500"
                )}>
                  {stat.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  <span>{stat.change} from last month</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">Revenue Analytics</h3>
            <select className="bg-background border border-border rounded-lg text-xs px-2 py-1 outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Last 12 Months</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888888', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#888888', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">Student Growth</h3>
            <select className="bg-background border border-border rounded-lg text-xs px-2 py-1 outline-none">
              <option>By Month</option>
              <option>By Week</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888888', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#888888', fontSize: 12}} />
                <Tooltip 
                   cursor={{fill: 'rgba(var(--primary), 0.1)'}}
                   contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '12px', border: '1px solid #e5e7eb' }}
                />
                <Bar dataKey="students" radius={[6, 6, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 2 ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.4)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Enrollments Table */}
        <div className="lg:col-span-2 glass-card rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <h3 className="font-bold">Recent Enrollments</h3>
            <button className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
              View All <ArrowRight size={14} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs uppercase text-muted-foreground border-b border-white/5 bg-muted/50">
                  <th className="px-6 py-4 font-semibold">Student</th>
                  <th className="px-6 py-4 font-semibold">Course</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentEnrollments.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                          {item.student.charAt(0)}
                        </div>
                        <span className="font-medium">{item.student}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{item.course}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        item.status === 'Paid' ? "bg-green-500/10 text-green-500" :
                        item.status === 'Pending' ? "bg-orange-500/10 text-orange-500" : "bg-red-500/10 text-red-500"
                      )}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-sm">{item.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Live Classes */}
        <div className="glass-card p-6 rounded-2xl flex flex-col">
          <h3 className="font-bold mb-6">Upcoming Live Classes</h3>
          <div className="space-y-4 flex-1">
            {upcomingClasses.map((cls) => (
              <div key={cls.id} className="flex gap-4 p-3 rounded-xl hover:bg-white/5 transition-all group border border-transparent hover:border-white/10">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex flex-col items-center justify-center text-primary leading-none">
                  <span className="text-[10px] uppercase font-bold">{cls.date}</span>
                  <span className="font-bold text-lg">{cls.time.split(' ')[0]}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">{cls.title}</h4>
                  <p className="text-xs text-muted-foreground">{cls.batch} • {cls.time}</p>
                </div>
                <button className="self-center p-2 rounded-full hover:bg-primary/10 text-primary transition-all">
                  <PlayCircle size={20} />
                </button>
              </div>
            ))}
          </div>
          <button className="w-full py-3 mt-6 rounded-xl border border-dashed border-border hover:border-primary hover:text-primary transition-all text-sm font-medium text-muted-foreground">
            View Schedule
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
