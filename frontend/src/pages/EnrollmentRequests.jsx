import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Check, X, Eye, MessageSquare, ChevronDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../lib/api';
import { cn } from '../lib/utils';

const STATUS_CONFIG = {
  pending:           { label: 'Pending',           style: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', step: 0 },
  reviewed:          { label: 'Reviewed',          style: 'bg-blue-500/10 text-blue-500 border-blue-500/20', step: 1 },
  contacted:         { label: 'Contacted',         style: 'bg-purple-500/10 text-purple-500 border-purple-500/20', step: 2 },
  fee_set:           { label: 'Fee Set',           style: 'bg-orange-500/10 text-orange-500 border-orange-500/20', step: 3 },
  payment_requested: { label: 'Payment Requested', style: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20', step: 4 },
  verified:          { label: 'Verified',          style: 'bg-green-500/10 text-green-500 border-green-500/20', step: 5 },
  enrolled:          { label: 'Enrolled',          style: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', step: 6 },
  rejected:          { label: 'Rejected',          style: 'bg-red-500/10 text-red-500 border-red-500/20', step: -1 },
};

const WORKFLOW_STEPS = ['Request', 'Review', 'Contact', 'Fee Entry', 'Payment', 'Verify', 'Enroll'];
const NEXT_STATUS = { pending: 'reviewed', reviewed: 'contacted', contacted: 'fee_set', fee_set: 'payment_requested', payment_requested: 'verified', verified: 'enrolled' };

const EnrollmentRequests = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [updatingId, setUpdatingId] = useState(null);
  const limit = 15;

  const fetchEnrollments = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit, ...(statusFilter && { status: statusFilter }) };
      const { data } = await api.get('/enrollments', { params });
      setEnrollments(data.data.enrollments);
      setTotal(data.data.total);
    } catch {
      toast.error('Failed to load enrollments');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchEnrollments(); }, [fetchEnrollments]);

  const handleApprove = async (id) => {
    setUpdatingId(id);
    try {
      const { data } = await api.post(`/enrollments/${id}/approve`);
      setEnrollments((prev) => prev.map((e) => e.id === id ? { ...e, status: 'enrolled' } : e));
      toast.success('Student enrolled successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleReject = async (id) => {
    if (!confirm('Reject this enrollment request?')) return;
    setUpdatingId(id);
    try {
      await api.post(`/enrollments/${id}/reject`, { reason: 'Rejected by admin' });
      setEnrollments((prev) => prev.map((e) => e.id === id ? { ...e, status: 'rejected' } : e));
      toast.success('Enrollment rejected');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAdvanceStatus = async (enrollment) => {
    const next = NEXT_STATUS[enrollment.status];
    if (!next) return;
    setUpdatingId(enrollment.id);
    try {
      const { data } = await api.patch(`/enrollments/${enrollment.id}/status`, { status: next });
      setEnrollments((prev) => prev.map((e) => e.id === enrollment.id ? { ...e, status: next } : e));
      toast.success(`Status → ${STATUS_CONFIG[next]?.label}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = search
    ? enrollments.filter((e) =>
        e.Student?.name?.toLowerCase().includes(search.toLowerCase()) ||
        e.Course?.title?.toLowerCase().includes(search.toLowerCase())
      )
    : enrollments;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enrollment Requests</h1>
          <p className="text-muted-foreground mt-1">
            Review and manage student admission workflows.{' '}
            <span className="font-semibold text-primary">{total} total requests.</span>
          </p>
        </div>
        <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-xl border border-border flex-wrap">
          {['', 'pending', 'enrolled', 'rejected'].map((s) => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
              className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all',
                statusFilter === s ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
              {s === '' ? 'All' : STATUS_CONFIG[s]?.label || s}
            </button>
          ))}
        </div>
      </div>

      {/* Workflow stepper */}
      <div className="glass-card p-6 rounded-2xl overflow-x-auto">
        <div className="flex items-center min-w-[600px] justify-between relative px-4">
          <div className="absolute top-5 left-0 w-full h-0.5 bg-border z-0" />
          {WORKFLOW_STEPS.map((step, i) => (
            <div key={step} className="relative z-10 flex flex-col items-center gap-2">
              <div className={cn('w-10 h-10 rounded-full flex items-center justify-center border-4 border-background shadow-md text-xs font-bold',
                i < 3 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground')}>
                {i < 3 ? <Check size={14} /> : i + 1}
              </div>
              <span className={cn('text-[10px] font-bold uppercase tracking-widest whitespace-nowrap',
                i < 3 ? 'text-primary' : 'text-muted-foreground')}>{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/5 flex gap-4 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Filter by student or course..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-background/50 border border-border rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48"><Loader2 size={36} className="animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">No enrollment requests found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs uppercase text-muted-foreground border-b border-white/5 bg-muted/30">
                  <th className="px-6 py-4 font-semibold">Student</th>
                  <th className="px-6 py-4 font-semibold">Course</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((enr, i) => {
                  const cfg = STATUS_CONFIG[enr.status] || STATUS_CONFIG.pending;
                  const canAdvance = !!NEXT_STATUS[enr.status];
                  return (
                    <motion.tr key={enr.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                      className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-sm">{enr.Student?.name || '—'}</div>
                        <div className="text-xs text-muted-foreground">{enr.Student?.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium">{enr.Course?.title || '—'}</div>
                        {enr.final_fee && <div className="text-xs text-primary font-bold">₹{parseFloat(enr.final_fee).toLocaleString()}</div>}
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        {new Date(enr.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn('px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border', cfg.style)}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {updatingId === enr.id ? (
                            <Loader2 size={18} className="animate-spin text-primary" />
                          ) : (
                            <>
                              {canAdvance && enr.status !== 'enrolled' && enr.status !== 'rejected' && (
                                <button onClick={() => handleAdvanceStatus(enr)}
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white text-xs font-bold transition-all">
                                  <ChevronDown size={13} className="-rotate-90" />
                                  Advance
                                </button>
                              )}
                              {enr.status !== 'enrolled' && enr.status !== 'rejected' && (
                                <>
                                  <button onClick={() => handleApprove(enr.id)}
                                    className="p-2 rounded-lg hover:bg-green-500/10 text-green-500 transition-all" title="Enroll Now">
                                    <Check size={16} />
                                  </button>
                                  <button onClick={() => handleReject(enr.id)}
                                    className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-all" title="Reject">
                                    <X size={16} />
                                  </button>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 border-t border-white/5 flex items-center justify-between bg-muted/10">
          <p className="text-xs text-muted-foreground">Showing {filtered.length} of {total}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1 rounded-lg border border-border text-xs font-medium hover:bg-muted disabled:opacity-40">Previous</button>
            <button onClick={() => setPage((p) => p + 1)} disabled={page >= Math.ceil(total / limit)}
              className="px-3 py-1 rounded-lg border border-primary bg-primary text-white text-xs font-medium">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentRequests;
