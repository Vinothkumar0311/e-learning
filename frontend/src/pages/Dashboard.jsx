import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, Users, DollarSign, BookOpen, Clock,
  ArrowRight, PlayCircle, FileText, Plus, Loader2, UserCheck, AlertCircle
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

const CHART_DATA = [
  { name: 'Jan', revenue: 4000, students: 12 },
  { name: 'Feb', revenue: 6000, students: 20 },
  { name: 'Mar', revenue: 5200, students: 17 },
  { name: 'Apr', revenue: 8100, students: 30 },
  { name: 'May', revenue: 7500, students: 25 },
  { name: 'Jun', revenue: 9200, students: 35 },
  { name: 'Jul', revenue: 11000, students: 41 },
];

const StatCard = ({ title, value, icon, color, delay, prefix = '' }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    className="glass-card p-6 rounded-2xl group hover:scale-[1.02] transition-all duration-300 cursor-pointer">
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-muted-foreground">{title}</span>
      <div className={cn('p-2 rounded-lg bg-background/50 border border-border group-hover:scale-110 transition-transform', color)}>
        {icon}
      </div>
    </div>
    <div className="mt-4">
      <h3 className="text-2xl font-bold">{value === null ? <Loader2 size={22} className="animate-spin text-primary" /> : `${prefix}${(value ?? 0).toLocaleString()}`}</h3>
      <div className="flex items-center gap-1 text-xs mt-1 font-medium text-green-500">
        <TrendingUp size={12} />
        <span>Live data</span>
      </div>
    </div>
  </motion.div>
);

const STATUS_STYLE = {
  pending: 'bg-yellow-500/10 text-yellow-500',
  enrolled: 'bg-green-500/10 text-green-500',
  rejected: 'bg-red-500/10 text-red-500',
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentEnrollments, setRecentEnrollments] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, enrollRes, classRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/recent-enrollments'),
          api.get('/dashboard/upcoming-classes'),
        ]);
        setStats(statsRes.data.data);
        setRecentEnrollments(enrollRes.data.data);
        setUpcomingClasses(classRes.data.data);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchAll();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, <span className="font-semibold text-foreground">{user?.name}</span>. Here's what's happening today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/courses')} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all text-sm font-medium shadow-lg shadow-primary/20">
            <Plus size={18} /> Create New Course
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Students" value={stats?.totalStudents ?? null} icon={<Users size={18} />} color="text-blue-500" delay={0} />
        <StatCard title="Active Students" value={stats?.activeStudents ?? null} icon={<UserCheck size={18} />} color="text-green-500" delay={0.1} />
        <StatCard title="Total Courses" value={stats?.totalCourses ?? null} icon={<BookOpen size={18} />} color="text-purple-500" delay={0.2} />
        <StatCard title="Pending Requests" value={stats?.pendingEnrollments ?? null} icon={<AlertCircle size={18} />} color="text-orange-500" delay={0.3} />
      </div>

      {/* Revenue stat row */}
      <div className="glass-card p-6 rounded-2xl flex items-center gap-6">
        <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500">
          <DollarSign size={24} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Total Verified Revenue</p>
          <h2 className="text-3xl font-black">
            {loadingStats ? <Loader2 size={24} className="animate-spin text-primary inline" /> : `₹${(stats?.totalRevenue || 0).toLocaleString()}`}
          </h2>
        </div>
        <div className="ml-auto text-xs font-medium text-green-500 flex items-center gap-1">
          <TrendingUp size={14} /> From verified payments
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">Revenue Analytics</h3>
          </div>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART_DATA}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--background)', borderRadius: '12px', border: '1px solid var(--border)' }} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">Student Growth</h3>
          </div>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CHART_DATA}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--background)', borderRadius: '12px', border: '1px solid var(--border)' }} />
                <Bar dataKey="students" radius={[6, 6, 0, 0]}>
                  {CHART_DATA.map((_, i) => (
                    <Cell key={i} fill={i === CHART_DATA.length - 1 ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.4)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Enrollments */}
        <div className="lg:col-span-2 glass-card rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <h3 className="font-bold">Recent Enrollments</h3>
            <button onClick={() => navigate('/enrollments')} className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
              View All <ArrowRight size={14} />
            </button>
          </div>
          {loadingStats ? (
            <div className="flex items-center justify-center h-32"><Loader2 size={28} className="animate-spin text-primary" /></div>
          ) : recentEnrollments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No enrollments yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs uppercase text-muted-foreground border-b border-white/5 bg-muted/50">
                    <th className="px-6 py-4 font-semibold">Student</th>
                    <th className="px-6 py-4 font-semibold">Course</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentEnrollments.map((enr) => (
                    <tr key={enr.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                            {enr.Student?.name?.charAt(0)}
                          </div>
                          <span className="font-medium text-sm">{enr.Student?.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-sm text-muted-foreground">{enr.Course?.title}</td>
                      <td className="px-6 py-3">
                        <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider', STATUS_STYLE[enr.status] || 'bg-muted text-muted-foreground')}>
                          {enr.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-xs text-muted-foreground">
                        {new Date(enr.createdAt).toLocaleDateString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Upcoming Live Classes */}
        <div className="glass-card p-6 rounded-2xl flex flex-col">
          <h3 className="font-bold mb-6">Upcoming Live Classes</h3>
          {loadingStats ? (
            <div className="flex items-center justify-center flex-1"><Loader2 size={28} className="animate-spin text-primary" /></div>
          ) : upcomingClasses.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <Clock size={32} className="opacity-30" />
              <p className="text-sm text-center">No upcoming live classes scheduled.</p>
            </div>
          ) : (
            <div className="space-y-4 flex-1">
              {upcomingClasses.map((cls) => (
                <div key={cls.id} className="flex gap-4 p-3 rounded-xl hover:bg-white/5 transition-all group border border-transparent hover:border-white/10">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex flex-col items-center justify-center text-primary leading-none shrink-0">
                    <span className="text-[9px] uppercase font-bold">{new Date(cls.scheduled_at).toLocaleString('en', { month: 'short' })}</span>
                    <span className="font-bold text-lg">{new Date(cls.scheduled_at).getDate()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm group-hover:text-primary transition-colors truncate">{cls.title}</h4>
                    <p className="text-xs text-muted-foreground">{cls.Course?.title}</p>
                  </div>
                  <button className="self-center p-2 rounded-full hover:bg-primary/10 text-primary transition-all shrink-0">
                    <PlayCircle size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <button onClick={() => navigate('/live-classes')} className="w-full py-3 mt-6 rounded-xl border border-dashed border-border hover:border-primary hover:text-primary transition-all text-sm font-medium text-muted-foreground">
            View Full Schedule
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
