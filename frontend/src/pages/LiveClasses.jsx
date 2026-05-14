import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Video, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  MoreHorizontal,
  Users,
  MapPin,
  Search
} from 'lucide-react';
import { cn } from '../lib/utils';

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const schedule = [
  { time: '09:00 AM', title: 'UX Design Basics', batch: 'Batch A', instructor: 'Sarah Lee', type: 'Zoom' },
  { time: '11:30 AM', title: 'React Hooks Deep Dive', batch: 'Batch C', instructor: 'Alex Rivera', type: 'Google Meet' },
  { time: '02:00 PM', title: 'Backend with Node.js', batch: 'Batch B', instructor: 'David Chen', type: 'Internal' },
  { time: '04:30 PM', title: 'Mobile App Project', batch: 'Batch A', instructor: 'Sarah Lee', type: 'Zoom' },
];

const LiveClasses = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Live Classes</h1>
          <p className="text-muted-foreground mt-1">Schedule and manage interactive learning sessions.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all font-semibold shadow-lg shadow-primary/20">
          <Plus size={20} />
          Schedule New Class
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Calendar View */}
        <div className="xl:col-span-2 space-y-6">
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold">May 2024</h2>
                <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border">
                  <button className="p-1 rounded-md hover:bg-background transition-all"><ChevronLeft size={16} /></button>
                  <button className="p-1 rounded-md hover:bg-background transition-all"><ChevronRight size={16} /></button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {['Day', 'Week', 'Month'].map((v) => (
                  <button 
                    key={v}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                      v === 'Week' ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-7 gap-4">
              {days.map((day) => (
                <div key={day} className="text-center text-xs font-bold uppercase tracking-widest text-muted-foreground pb-4">
                  {day}
                </div>
              ))}
              {Array.from({ length: 31 }).map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "aspect-square rounded-2xl border border-border/50 flex flex-col p-2 transition-all cursor-pointer group",
                    i + 1 === 14 ? "bg-primary/10 border-primary shadow-sm" : "hover:border-primary/30 hover:bg-white/5"
                  )}
                >
                  <span className={cn(
                    "text-sm font-bold",
                    i + 1 === 14 ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}>{i + 1}</span>
                  { (i + 1 === 14 || i + 1 === 16 || i + 1 === 20) && (
                    <div className="mt-auto flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      {i + 1 === 14 && <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Users size={18} className="text-primary" />
              Batch Performance
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {['Batch A', 'Batch B', 'Batch C', 'Batch D'].map((b) => (
                <div key={b} className="p-4 rounded-xl bg-background border border-border text-center space-y-1">
                  <div className="text-xs font-bold text-muted-foreground uppercase">{b}</div>
                  <div className="text-lg font-black">92%</div>
                  <div className="text-[10px] text-green-500 font-bold">Attendance</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Schedule List */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold">Today's Schedule</h3>
              <span className="text-xs font-bold text-primary px-2 py-1 bg-primary/10 rounded-lg">14 May</span>
            </div>
            
            <div className="space-y-4 flex-1">
              {schedule.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 rounded-2xl border border-border hover:border-primary/30 hover:bg-white/5 transition-all group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 text-primary">
                      <Clock size={14} />
                      <span className="text-xs font-bold">{item.time}</span>
                    </div>
                    <button className="p-1 rounded hover:bg-muted transition-colors opacity-0 group-hover:opacity-100">
                      <MoreHorizontal size={14} />
                    </button>
                  </div>
                  <h4 className="font-bold text-sm mb-1 group-hover:text-primary transition-colors">{item.title}</h4>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Users size={10} /> {item.batch}</span>
                    <span className="flex items-center gap-1"><Video size={10} /> {item.type}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-muted border border-border"></div>
                      <span className="text-[10px] font-medium">{item.instructor}</span>
                    </div>
                    <button className="px-3 py-1.5 rounded-lg bg-primary text-white text-[10px] font-bold uppercase tracking-wider shadow-sm hover:scale-105 active:scale-95 transition-all">
                      Start Class
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            <button className="w-full py-3 mt-6 rounded-xl border border-dashed border-border hover:border-primary hover:text-primary transition-all text-sm font-medium text-muted-foreground">
              View All Events
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveClasses;
