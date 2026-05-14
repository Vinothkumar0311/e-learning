import React from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Download, 
  Eye, 
  MoreVertical, 
  CreditCard, 
  TrendingUp, 
  DollarSign, 
  FileText,
  Filter
} from 'lucide-react';
import { cn } from '../lib/utils';

const payments = [
  { id: "PAY-8241", student: "Alice Johnson", amount: "$199.00", method: "Razorpay", date: "2024-05-14", status: "Paid" },
  { id: "PAY-8242", student: "Bob Smith", amount: "$249.00", method: "Stripe", date: "2024-05-13", status: "Pending" },
  { id: "PAY-8243", student: "Charlie Brown", amount: "$499.00", method: "Bank Transfer", date: "2024-05-13", status: "Paid" },
  { id: "PAY-8244", student: "Diana Prince", amount: "$149.00", method: "Razorpay", date: "2024-05-12", status: "Failed" },
  { id: "PAY-8245", student: "Ethan Hunt", amount: "$299.00", method: "PayPal", date: "2024-05-12", status: "Refunded" },
];

const Payments = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments & Revenue</h1>
          <p className="text-muted-foreground mt-1">Track transactions and financial performance.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all font-semibold shadow-lg shadow-primary/20">
          <Download size={20} />
          Export Reports
        </button>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <DollarSign size={80} />
          </div>
          <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-3xl font-bold">$42,592</h3>
            <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded">+15.2%</span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <TrendingUp size={14} className="text-green-500" />
            <span>Up from $36,940 last month</span>
          </div>
        </div>
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <CreditCard size={80} />
          </div>
          <p className="text-sm font-medium text-muted-foreground">Successful Payments</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-3xl font-bold">1,248</h3>
            <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded">+8.4%</span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <TrendingUp size={14} className="text-green-500" />
            <span>Highest conversion this week</span>
          </div>
        </div>
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <FileText size={80} />
          </div>
          <p className="text-sm font-medium text-muted-foreground">Pending Payouts</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-3xl font-bold">$12,450</h3>
            <span className="text-xs font-bold text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded">8 Pending</span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <span>Next payout scheduled for Monday</span>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search transactions..."
                className="w-full bg-background/50 border border-border rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl border border-border">
              {['All', 'Paid', 'Failed'].map((f) => (
                <button 
                  key={f}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                    f === 'All' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
            <button className="p-2 rounded-xl border border-border hover:bg-muted transition-colors">
              <Filter size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs uppercase text-muted-foreground border-b border-white/5 bg-muted/30">
                <th className="px-6 py-4 font-semibold">Transaction ID</th>
                <th className="px-6 py-4 font-semibold">Student</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Method</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {payments.map((p, i) => (
                <motion.tr 
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-white/5 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-bold text-primary">{p.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-sm">{p.student}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-black text-sm">{p.amount}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-muted-foreground">{p.method}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-muted-foreground">{p.date}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                      p.status === 'Paid' ? "bg-green-500/10 text-green-500 border-green-500/20" :
                      p.status === 'Pending' ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                      p.status === 'Refunded' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                      "bg-red-500/10 text-red-500 border-red-500/20"
                    )}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-all">
                        <Eye size={18} />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-all">
                        <Download size={18} />
                      </button>
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
      </div>
    </div>
  );
};

export default Payments;
