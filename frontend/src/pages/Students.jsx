import React from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  UserPlus, 
  MoreVertical, 
  Mail, 
  Calendar,
  Eye
} from 'lucide-react';
import { cn } from '../lib/utils';

const students = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", courses: 3, progress: 75, joinDate: "Jan 2024", avatar: "7x/avataaars/svg?seed=Alice" },
  { id: 2, name: "Bob Smith", email: "bob@example.com", courses: 1, progress: 20, joinDate: "Feb 2024", avatar: "7x/avataaars/svg?seed=Bob" },
  { id: 3, name: "Charlie Brown", email: "charlie@example.com", courses: 5, progress: 95, joinDate: "Jan 2024", avatar: "7x/avataaars/svg?seed=Charlie" },
  { id: 4, name: "Diana Prince", email: "diana@example.com", courses: 2, progress: 45, joinDate: "Mar 2024", avatar: "7x/avataaars/svg?seed=Diana" },
  { id: 5, name: "Ethan Hunt", email: "ethan@example.com", courses: 4, progress: 60, joinDate: "Dec 2023", avatar: "7x/avataaars/svg?seed=Ethan" },
];

const Students = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Directory</h1>
          <p className="text-muted-foreground mt-1">Manage and track student learning journeys.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all font-semibold shadow-lg shadow-primary/20">
          <UserPlus size={20} />
          Add Student
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl space-y-6">
            <div>
              <h3 className="font-bold mb-4">Search Students</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Name, email or ID..."
                  className="w-full bg-background border border-border rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Batch Selection</h3>
              <div className="space-y-2">
                {['Fullstack Dev', 'UI/UX Design', 'Cybersecurity', 'Mobile App'].map((batch) => (
                  <label key={batch} className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" className="rounded border-border text-primary focus:ring-primary/20" />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{batch}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-4">Learning Status</h3>
              <select className="w-full bg-background border border-border rounded-xl text-sm px-4 py-2 outline-none">
                <option>All Students</option>
                <option>Active</option>
                <option>Completed</option>
                <option>Inactive</option>
              </select>
            </div>

            <button className="w-full py-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all text-sm font-bold uppercase tracking-wider">
              Apply Filters
            </button>
          </div>

          <div className="glass-card p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <h3 className="font-bold mb-2">Student Insights</h3>
            <p className="text-xs text-muted-foreground mb-4">12% increase in active students compared to last month.</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Completion Rate</span>
                <span className="font-bold text-primary">68%</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '68%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Student List */}
        <div className="lg:col-span-3 space-y-4">
          {students.map((student, i) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-4 rounded-2xl group hover:border-primary/30 transition-all duration-300"
            >
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary/20 to-secondary/20 flex items-center justify-center border border-white/10 shrink-0">
                  <img 
                    src={`https://api.dicebear.com/${student.avatar}`}
                    alt={student.name}
                    className="w-12 h-12"
                  />
                </div>
                <div className="flex-1 text-center md:text-left space-y-1">
                  <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{student.name}</h3>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Mail size={12} /> {student.email}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar size={12} /> Joined {student.joinDate}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-8 px-8 border-x border-white/5 hidden xl:flex">
                  <div className="text-center">
                    <div className="text-lg font-black">{student.courses}</div>
                    <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Courses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-black">{student.progress}%</div>
                    <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Progress</div>
                  </div>
                </div>
                <div className="w-full md:w-32 space-y-1.5 shrink-0">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                    <span>Overall Progress</span>
                    <span className="text-primary">{student.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${student.progress}%` }}
                      className="h-full bg-gradient-to-r from-primary to-secondary"
                    ></motion.div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2.5 rounded-xl bg-background border border-border hover:bg-primary/10 hover:text-primary transition-all">
                    <Eye size={18} />
                  </button>
                  <button className="p-2.5 rounded-xl bg-background border border-border hover:bg-muted transition-all">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          <div className="flex items-center justify-center pt-4">
            <button className="px-6 py-2 rounded-xl border border-border hover:bg-muted transition-all text-sm font-medium">
              Load More Students
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Students;
