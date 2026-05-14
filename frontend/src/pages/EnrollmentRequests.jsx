import React from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Check, 
  X, 
  Eye, 
  Send,
  User,
  Calendar,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { cn } from '../lib/utils';

const requests = [
  { id: 1, student: "Michael Scott", course: "Management Mastery", date: "2024-05-14", status: "Pending", email: "michael@dundermifflin.com" },
  { id: 2, student: "Pam Beesly", course: "Digital Illustration", date: "2024-05-13", status: "Reviewed", email: "pam@art.com" },
  { id: 3, student: "Jim Halpert", course: "Sales Strategy", date: "2024-05-13", status: "Contacted", email: "jim@sales.com" },
  { id: 4, student: "Dwight Schrute", course: "Security & Protection", date: "2024-05-12", status: "Fee Set", email: "dwight@beets.com" },
  { id: 5, student: "Angela Martin", course: "Financial Accounting", date: "2024-05-12", status: "Verified", email: "angela@cats.com" },
];

const getStatusStyles = (status) => {
  switch (status) {
    case 'Pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    case 'Reviewed': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'Contacted': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    case 'Fee Set': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    case 'Verified': return 'bg-green-500/10 text-green-500 border-green-500/20';
    default: return 'bg-muted text-muted-foreground border-border';
  }
};

const EnrollmentRequests = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enrollment Requests</h1>
          <p className="text-muted-foreground mt-1">Review and manage student admission workflows.</p>
        </div>
        <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-xl border border-border">
          {['Active', 'Archived', 'Declined'].map((tab) => (
            <button 
              key={tab}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                tab === 'Active' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Workflow Progress (Visual Guide) */}
      <div className="glass-card p-6 rounded-2xl overflow-x-auto">
        <div className="flex items-center min-w-[800px] justify-between relative px-4">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-border -translate-y-1/2 z-0"></div>
          {['Request', 'Review', 'Contact', 'Fee Entry', 'Payment', 'Verify', 'Enroll'].map((step, i) => (
            <div key={step} className="relative z-10 flex flex-col items-center gap-2">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border-4 border-background shadow-md",
                i < 3 ? "bg-primary text-white" : "bg-muted text-muted-foreground"
              )}>
                {i < 3 ? <Check size={16} /> : <span className="text-xs font-bold">{i + 1}</span>}
              </div>
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-widest",
                i < 3 ? "text-primary" : "text-muted-foreground"
              )}>{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Requests Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Filter by student or course..."
              className="w-full bg-background/50 border border-border rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-xl border border-border hover:bg-muted transition-colors">
              <Filter size={18} />
            </button>
            <select className="bg-background border border-border rounded-xl text-xs px-3 py-2 outline-none">
              <option>Sort by Date</option>
              <option>Sort by Status</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs uppercase text-muted-foreground border-b border-white/5 bg-muted/30">
                <th className="px-6 py-4 font-semibold">Student Details</th>
                <th className="px-6 py-4 font-semibold">Course Interested</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {requests.map((request, i) => (
                <motion.tr 
                  key={request.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-white/5 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center overflow-hidden">
                        <User size={20} className="text-primary" />
                      </div>
                      <div>
                        <div className="font-bold">{request.student}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar size={10} /> {request.date}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium">{request.course}</div>
                    <div className="text-xs text-muted-foreground">{request.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                      getStatusStyles(request.status)
                    )}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-all active:scale-95 tooltip" title="Quick View">
                        <Eye size={18} />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-green-500/10 text-green-500 transition-all active:scale-95" title="Approve">
                        <Check size={18} />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-all active:scale-95" title="Reject">
                        <X size={18} />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-purple-500/10 text-purple-500 transition-all active:scale-95" title="Contact">
                        <MessageSquare size={18} />
                      </button>
                      <div className="w-px h-4 bg-border mx-1"></div>
                      <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-all">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-white/5 flex items-center justify-between bg-muted/10">
          <p className="text-xs text-muted-foreground">Showing 5 of 156 total requests</p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 rounded-lg border border-border text-xs font-medium disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 rounded-lg border border-primary bg-primary text-white text-xs font-medium shadow-sm">1</button>
            <button className="px-3 py-1 rounded-lg border border-border text-xs font-medium hover:bg-muted">2</button>
            <button className="px-3 py-1 rounded-lg border border-border text-xs font-medium hover:bg-muted">3</button>
            <button className="px-3 py-1 rounded-lg border border-border text-xs font-medium hover:bg-muted">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentRequests;
