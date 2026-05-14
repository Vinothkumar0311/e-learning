import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  TrendingUp, 
  Users, 
  BookOpen, 
  Star,
  FileText,
  Filter,
  PieChart as PieIcon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { cn } from '../lib/utils';

const data = [
  { name: 'Mon', revenue: 2400, students: 400 },
  { name: 'Tue', revenue: 1398, students: 300 },
  { name: 'Wed', revenue: 9800, students: 2000 },
  { name: 'Thu', revenue: 3908, students: 2780 },
  { name: 'Fri', revenue: 4800, students: 1890 },
  { name: 'Sat', revenue: 3800, students: 2390 },
  { name: 'Sun', revenue: 4300, students: 3490 },
];

const pieData = [
  { name: 'UI/UX', value: 400 },
  { name: 'Development', value: 300 },
  { name: 'Business', value: 300 },
  { name: 'Marketing', value: 200 },
];

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', '#10b981', '#f59e0b'];

const Reports = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Advanced Reports</h1>
          <p className="text-muted-foreground mt-1">Deep dive into your platform's performance metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-background border border-border hover:bg-muted transition-all text-sm font-medium">
            <Calendar size={18} />
            May 2024
          </button>
          <div className="flex items-center bg-primary rounded-xl overflow-hidden shadow-lg shadow-primary/20">
            <button className="px-4 py-3 text-white hover:bg-primary/90 transition-all font-bold text-sm border-r border-white/10 flex items-center gap-2">
              <Download size={18} /> Export PDF
            </button>
            <button className="p-3 text-white hover:bg-primary/90 transition-all">
              <Filter size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Growth Chart */}
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-lg">Weekly Growth Comparison</h3>
            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span>Current Week</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary/30"></div>
                <span>Previous Week</span>
              </div>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888888', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#888888', fontSize: 12}} />
                <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey="students" fill="hsl(var(--primary) / 0.3)" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution Chart */}
        <div className="glass-card p-6 rounded-3xl flex flex-col">
          <h3 className="font-bold text-lg mb-8">Course Distribution</h3>
          <div className="flex-1 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-6">
            {pieData.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-bold">{item.value} Enrollments</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Avg. Course Rating', value: '4.8', icon: Star, color: 'text-orange-500' },
          { label: 'Active Certificates', value: '1,240', icon: FileText, color: 'text-blue-500' },
          { label: 'Course Completion', value: '72%', icon: TrendingUp, color: 'text-green-500' },
          { label: 'Total Learning Hrs', value: '12.4k', icon: Clock, color: 'text-purple-500' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + (i * 0.1) }}
            className="glass-card p-6 rounded-2xl flex items-center gap-4"
          >
            <div className={cn("p-3 rounded-xl bg-background border border-border shadow-sm", stat.color)}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
              <h4 className="text-2xl font-black">{stat.value}</h4>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const Clock = ({ size, className }) => <BookOpen size={size} className={className} />; // Placeholder fix

export default Reports;
