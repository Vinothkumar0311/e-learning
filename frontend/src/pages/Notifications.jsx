import React from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Send, 
  Plus, 
  Trash2, 
  Clock, 
  CheckCircle2,
  Users,
  Smartphone
} from 'lucide-react';
import { cn } from '../lib/utils';

const history = [
  { id: 1, title: 'New Course Announcement', type: 'Email', sentTo: 'All Students', date: 'May 14, 02:30 PM', status: 'Sent' },
  { id: 2, title: 'Live Class Reminder', type: 'Push', sentTo: 'Batch A', date: 'May 14, 09:00 AM', status: 'Scheduled' },
  { id: 3, title: 'Holiday Notice', type: 'Broadcast', sentTo: 'Everyone', date: 'May 12, 11:00 AM', status: 'Sent' },
];

const Notifications = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-1">Send updates and reminders to your students.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Composer */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-8 rounded-3xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Plus size={20} className="text-primary" />
              New Notification
            </h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 'push', icon: Smartphone, label: 'Push Notification' },
                  { id: 'email', icon: Mail, label: 'Email Broadcast' },
                  { id: 'sms', icon: MessageSquare, label: 'SMS Alert' },
                ].map((type) => (
                  <button 
                    key={type.id}
                    className={cn(
                      "flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all",
                      type.id === 'push' ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/30"
                    )}
                  >
                    <type.icon size={24} />
                    <span className="text-xs font-bold uppercase tracking-widest">{type.label}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Recipient Group</label>
                  <select className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all">
                    <option>All Registered Students</option>
                    <option>Batch A (UI/UX)</option>
                    <option>Batch B (React)</option>
                    <option>Enrolled in "Fullstack Web Dev"</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Title</label>
                  <input 
                    type="text" 
                    placeholder="Enter notification title..."
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Message Content</label>
                  <textarea 
                    rows={4}
                    placeholder="Type your message here..."
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                  ></textarea>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                      <Clock size={18} />
                      Schedule for later
                    </button>
                  </div>
                  <button className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all font-bold shadow-lg shadow-primary/20">
                    <Send size={18} />
                    Send Notification Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent History */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-3xl h-full flex flex-col">
            <h3 className="font-bold mb-6 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-green-500" />
              Recently Sent
            </h3>
            
            <div className="space-y-4 flex-1">
              {history.map((item, i) => (
                <div key={i} className="p-4 rounded-2xl bg-background border border-border group hover:border-primary/30 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <span className={cn(
                      "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest",
                      item.type === 'Email' ? "bg-blue-500/10 text-blue-500" : "bg-purple-500/10 text-purple-500"
                    )}>
                      {item.type}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground">{item.date}</span>
                  </div>
                  <h4 className="font-bold text-sm mb-1 group-hover:text-primary transition-colors">{item.title}</h4>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users size={12} /> {item.sentTo}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className={cn(
                      "flex items-center gap-1 text-[10px] font-bold uppercase",
                      item.status === 'Sent' ? "text-green-500" : "text-orange-500"
                    )}>
                      <CheckCircle2 size={10} /> {item.status}
                    </div>
                    <button className="p-1 rounded hover:bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full py-3 mt-6 rounded-xl bg-muted/50 border border-border hover:bg-muted transition-all text-sm font-medium text-muted-foreground">
              View Detailed Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
