import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Download, 
  Eye, 
  MoreVertical, 
  CreditCard, 
  TrendingUp, 
  DollarSign, 
  FileText,
  Filter,
  Loader2,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import api from '../lib/api';
import { toast } from 'sonner';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Live stats computed dynamically
  const [stats, setStats] = useState({
    totalRevenue: 0,
    successfulCount: 0,
    pendingCount: 0,
    pendingAmount: 0
  });

  const limit = 15;

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: search.trim() || undefined,
        status: statusFilter !== 'All' ? statusFilter.toLowerCase() : undefined
      };

      const response = await api.get('/payments', { params });
      if (response.data?.success) {
        const payload = response.data.data;
        setPayments(payload.payments || []);
        setTotal(payload.total || 0);
        setTotalPages(payload.pages || 1);
      }
    } catch (err) {
      toast.error('Failed to load transaction logs');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  const fetchStats = useCallback(async () => {
    try {
      // Fetch global dashboard metrics
      const dashStatsRes = await api.get('/dashboard/stats');
      
      // Fetch recent payment records to compute breakdowns
      const paymentsRes = await api.get('/payments', { params: { limit: 1000 } });
      
      if (paymentsRes.data?.success) {
        const allPayments = paymentsRes.data.data.payments || [];
        
        const successful = allPayments.filter(p => p.status === 'paid');
        const pending = allPayments.filter(p => p.status === 'pending');
        
        const sumSuccessful = successful.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
        const sumPending = pending.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
        
        setStats({
          totalRevenue: dashStatsRes.data?.data?.totalRevenue || sumSuccessful,
          successfulCount: successful.length,
          pendingCount: pending.length,
          pendingAmount: sumPending
        });
      }
    } catch (err) {
      console.error('Failed to calculate financial statistics', err);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleExport = () => {
    try {
      // Download payments report CSV
      const token = localStorage.getItem('token');
      // Construct exact backend download link
      const exportUrl = `http://localhost:5000/api/payments/export`;
      
      // Perform direct download opening window
      window.open(exportUrl, '_blank');
      toast.success('Exporting transactions CSV report');
    } catch (err) {
      toast.error('Failed to export reports');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/75 bg-clip-text text-transparent">Payments & Revenue</h1>
          <p className="text-muted-foreground mt-1">Track transaction logs, invoices, and financial milestones from live database records.</p>
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white hover:bg-primary/95 transition-all font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transform hover:-translate-y-0.5 active:translate-y-0 text-sm"
        >
          <Download size={18} />
          Export Reports
        </button>
      </div>

      {/* Revenue Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Revenue Card */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group border border-white/5 bg-gradient-to-br from-primary/5 to-transparent">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <DollarSign size={90} className="text-primary" />
          </div>
          <p className="text-sm font-semibold text-muted-foreground">Total Revenue Earned</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-3.5xl font-black tracking-tight text-foreground">
              ₹{parseFloat(stats.totalRevenue).toLocaleString('en-IN')}
            </h3>
            <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-lg">Live</span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <TrendingUp size={14} className="text-emerald-500" />
            <span>Sum of all verified payments</span>
          </div>
        </div>

        {/* Successful Payments Card */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group border border-white/5">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <CreditCard size={90} className="text-emerald-500" />
          </div>
          <p className="text-sm font-semibold text-muted-foreground">Successful Payments</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-3.5xl font-black tracking-tight text-foreground">
              {stats.successfulCount}
            </h3>
            <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-lg">✓ Settled</span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 size={14} className="text-emerald-500" />
            <span>Fully approved transactions</span>
          </div>
        </div>

        {/* Outstanding/Pending Payouts Card */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group border border-white/5">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <FileText size={90} className="text-orange-500" />
          </div>
          <p className="text-sm font-semibold text-muted-foreground">Awaiting Verification</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-3.5xl font-black tracking-tight text-foreground">
              ₹{parseFloat(stats.pendingAmount).toLocaleString('en-IN')}
            </h3>
            <span className="text-xs font-bold text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-lg">
              {stats.pendingCount} Pending
            </span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <AlertCircle size={14} className="text-orange-500" />
            <span>Requires administrator validation</span>
          </div>
        </div>
      </div>

      {/* Transactions Table Container */}
      <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search by student name or email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-background/50 border border-border rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl border border-border">
              {['All', 'Paid', 'Pending', 'Failed'].map((f) => (
                <button 
                  key={f}
                  onClick={() => {
                    setStatusFilter(f);
                    setPage(1);
                  }}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                    f === statusFilter 
                      ? "bg-background text-foreground shadow-sm border border-white/5" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
            <Loader2 className="animate-spin text-primary" size={32} />
            <p className="text-xs font-semibold uppercase tracking-wider">Syncing live payments data...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground text-center">
            <AlertCircle size={36} className="text-muted-foreground/40 mb-2" />
            <p className="text-sm font-semibold">No Transactions Found</p>
            <p className="text-xs text-muted-foreground/60 mt-0.5">Try altering your search query or status filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs uppercase text-muted-foreground border-b border-white/5 bg-muted/30">
                  <th className="px-6 py-4 font-semibold">Transaction ID</th>
                  <th className="px-6 py-4 font-semibold">Student</th>
                  <th className="px-6 py-4 font-semibold">Course Module</th>
                  <th className="px-6 py-4 font-semibold">Amount</th>
                  <th className="px-6 py-4 font-semibold">Method</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence mode="popLayout">
                  {payments.map((p, i) => (
                    <motion.tr 
                      key={p.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15, delay: Math.min(i * 0.03, 0.3) }}
                      className="hover:bg-white/5 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-bold text-primary">TXN-{p.id.toString().padStart(5, '0')}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-sm text-foreground">{p.Student?.name || 'Unknown Student'}</div>
                        <div className="text-[10px] text-muted-foreground">{p.Student?.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-semibold text-foreground">
                          {p.Enrollment?.Course?.title || 'Course Access Plan'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-black text-sm text-foreground">₹{parseFloat(p.amount).toLocaleString('en-IN')}</div>
                      </td>
                      <td className="px-6 py-4 font-semibold">
                        <span className="text-xs text-muted-foreground/80">{p.payment_mode || p.method || 'Manual/Cash'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(p.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                          p.status === 'paid' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                          p.status === 'pending' ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20 animate-pulse" :
                          "bg-red-500/10 text-red-400 border-red-500/20"
                        )}>
                          {p.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-white/5 flex items-center justify-between bg-muted/10">
            <p className="text-xs text-muted-foreground">Showing {payments.length} of {total} transactions</p>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage((p) => Math.max(1, p - 1))} 
                disabled={page === 1}
                className="px-4 py-2 rounded-xl border border-border text-xs font-bold hover:bg-muted disabled:opacity-40 transition-all"
              >
                Previous
              </button>
              <button 
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))} 
                disabled={page >= totalPages}
                className="px-4 py-2 rounded-xl border border-primary bg-primary text-white text-xs font-bold hover:bg-primary/95 disabled:opacity-40 transition-all shadow-md shadow-primary/10"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payments;
