import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, Check, X, Eye, ChevronRight, Loader2, 
  UserCheck, ShieldAlert, Award, Calendar, DollarSign, Ban, Wallet, Send
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../lib/api';
import { cn } from '../lib/utils';
import AmountAssignModal from '../components/enrollments/AmountAssignModal';
import ManualPaymentModal from '../components/enrollments/ManualPaymentModal';
import BlockAccessModal from '../components/enrollments/BlockAccessModal';
import RequestPaymentModal from '../components/enrollments/RequestPaymentModal';

const STATUS_CONFIG = {
  // Brand new Cart statuses
  Pending: { label: 'Pending Request', style: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', step: 0 },
  Reviewing: { label: 'Under Review', style: 'bg-blue-500/10 text-blue-500 border-blue-500/20', step: 1 },
  Approved: { label: 'Approved', style: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20', step: 2 },
  AmountAssigned: { label: 'Amount Assigned', style: 'bg-orange-500/10 text-orange-500 border-orange-500/20', step: 3 },
  PaymentPending: { label: 'Awaiting Payment', style: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20', step: 4 },
  PaymentSubmitted: { label: 'Payment Submitted', style: 'bg-amber-500/10 text-amber-500 border-amber-500/20', step: 5 },
  PaymentVerified: { label: 'Payment Verified', style: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', step: 6 },
  Enrolled: { label: 'Enrolled', style: 'bg-green-500/10 text-green-500 border-green-500/20', step: 7 },
  Rejected: { label: 'Rejected', style: 'bg-red-500/10 text-red-500 border-red-500/20', step: -1 },

  // Backward compatibility support for older seeded entries
  pending: { label: 'Pending Request', style: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', step: 0 },
  reviewed: { label: 'Under Review', style: 'bg-blue-500/10 text-blue-500 border-blue-500/20', step: 1 },
  contacted: { label: 'Contacted', style: 'bg-purple-500/10 text-purple-500 border-purple-500/20', step: 2 },
  fee_set: { label: 'Fee Set', style: 'bg-orange-500/10 text-orange-500 border-orange-500/20', step: 3 },
  payment_requested: { label: 'Awaiting Payment', style: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20', step: 4 },
  verified: { label: 'Payment Verified', style: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', step: 6 },
  enrolled: { label: 'Enrolled', style: 'bg-green-500/10 text-green-500 border-green-500/20', step: 7 },
  rejected: { label: 'Rejected', style: 'bg-red-500/10 text-red-500 border-red-500/20', step: -1 }
};

const WORKFLOW_STEPS = ['Request', 'Review', 'Approve', 'Assign Amount', 'Awaiting Pay', 'Submitted', 'Verify', 'Enroll'];

const EnrollmentRequests = () => {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [updatingId, setUpdatingId] = useState(null);
  
  // Custom dialog state
  const [activeAssignEnrollment, setActiveAssignEnrollment] = useState(null);
  const [activePaymentEnrollment, setActivePaymentEnrollment] = useState(null);
  const [activeBlockEnrollment, setActiveBlockEnrollment] = useState(null);
  const [activeRequestEnrollment, setActiveRequestEnrollment] = useState(null);
  
  const limit = 15;

  const fetchEnrollments = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit, ...(statusFilter && { status: statusFilter }) };
      const { data } = await api.get('/enrollments', { params });
      setEnrollments(data.data.enrollments);
      setTotal(data.data.total);
    } catch {
      toast.error('Failed to load enrollments requests pipeline');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { 
    fetchEnrollments(); 
  }, [fetchEnrollments]);

  const handleVerifyStudent = async (id) => {
    setUpdatingId(id);
    try {
      await api.patch(`/enrollments/${id}/verify-student`);
      setEnrollments((prev) => prev.map((e) => e.id === id ? { ...e, request_status: 'Reviewing', status: 'reviewed' } : e));
      toast.success('Student verified successfully! Application under review');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleApproveEnrollment = async (id) => {
    setUpdatingId(id);
    try {
      await api.patch(`/enrollments/${id}/approve`);
      setEnrollments((prev) => prev.map((e) => e.id === id ? { ...e, request_status: 'Approved', status: 'payment_requested' } : e));
      toast.success('Enrollment approved! Payment request sent to student');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approval failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRejectEnrollment = async (id) => {
    const reason = prompt('Enter the rejection reason:');
    if (reason === null) return; // cancelled
    setUpdatingId(id);
    try {
      await api.post(`/enrollments/${id}/reject`, { reason });
      setEnrollments((prev) => prev.map((e) => e.id === id ? { ...e, request_status: 'Rejected', status: 'rejected', admin_notes: reason } : e));
      toast.success('Enrollment rejected');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Rejection failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const onEnrollmentUpdated = (id, updatedEnrollment) => {
    setEnrollments((prev) => prev.map((e) => e.id === id ? { 
      ...e, 
      ...updatedEnrollment
    } : e));
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
          <h1 className="text-3xl font-bold tracking-tight">Enrollment Request Pipeline</h1>
          <p className="text-muted-foreground mt-1">
            Review manual course admissions, set amounts, and process multi-step workflows.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-xl border border-border flex-wrap font-semibold">
          {['', 'Pending', 'Reviewing', 'Approved', 'AmountAssigned', 'Enrolled', 'Rejected'].map((s) => (
            <button 
              key={s} 
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all',
                statusFilter === s 
                  ? 'bg-background text-foreground shadow-sm border border-white/5' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {s === '' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Table grid */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/5 flex gap-4 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by student or course..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-background/50 border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 size={36} className="animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">No enrollment requests found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs uppercase text-muted-foreground border-b border-white/5 bg-muted/30">
                  <th className="px-6 py-4 font-semibold">Student</th>
                  <th className="px-6 py-4 font-semibold">Course</th>
                  <th className="px-6 py-4 font-semibold">Stages</th>
                  <th className="px-6 py-4 font-semibold">Financials</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((enr, i) => {
                  const currentStatus = enr.request_status || enr.status || 'Pending';
                  const cfg = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.Pending;
                  const stepIndex = cfg.step;
                  
                  return (
                    <motion.tr 
                      key={enr.id} 
                      initial={{ opacity: 0, x: -10 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      transition={{ delay: i * 0.04 }}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-sm">{enr.Student?.name || '—'}</div>
                        <div className="text-xs text-muted-foreground">{enr.Student?.email}</div>
                        {enr.Student?.phone && <div className="text-[10px] text-muted-foreground/60">{enr.Student?.phone}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium">{enr.Course?.title || '—'}</div>
                        <div className="text-[10px] text-muted-foreground/80 mt-0.5">Applied: {new Date(enr.createdAt).toLocaleDateString('en-IN')}</div>
                      </td>
                      <td className="px-6 py-4">
                        {/* Mini timeline indicator */}
                        <div className="flex items-center gap-1">
                          {WORKFLOW_STEPS.map((step, idx) => {
                            const isCompleted = stepIndex >= idx && currentStatus !== 'Rejected';
                            const isCurrent = stepIndex === idx && currentStatus !== 'Rejected';
                            
                            return (
                              <div 
                                key={step} 
                                title={step}
                                className={cn(
                                  "w-2.5 h-2.5 rounded-full transition-all duration-300",
                                  currentStatus === 'Rejected' ? 'bg-red-500/20' : 
                                  isCurrent ? 'bg-primary ring-2 ring-primary/45 scale-125' :
                                  isCompleted ? 'bg-green-500' : 'bg-muted'
                                )}
                              />
                            );
                          })}
                        </div>
                        <span className="text-[10px] text-muted-foreground block mt-1 font-semibold">
                          Step {stepIndex + 1} of {WORKFLOW_STEPS.length}: {WORKFLOW_STEPS[stepIndex] || 'Completed'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {enr.final_amount ? (
                          <div className="space-y-1">
                            <div className="text-xs font-bold text-primary flex items-center gap-0.5">
                              <span className="text-[10px] font-normal text-muted-foreground mr-1">Fee:</span>
                              ₹{parseFloat(enr.final_amount).toLocaleString('en-IN')}
                            </div>
                            {parseFloat(enr.discount_amount) > 0 && (
                              <div className="text-[10px] text-green-500 font-medium">
                                Disc: -₹{parseFloat(enr.discount_amount).toLocaleString('en-IN')}
                              </div>
                            )}
                            <div className="text-[10px] text-emerald-500 font-semibold flex items-center gap-0.5">
                              <span className="text-[9px] font-normal text-muted-foreground mr-1">Paid:</span>
                              ₹{parseFloat(enr.paid_amount || 0).toLocaleString('en-IN')}
                            </div>
                            <div className="text-[10px] font-bold flex items-center gap-0.5">
                              <span className="text-[9px] font-normal text-muted-foreground mr-1">Due:</span>
                              {parseFloat(enr.final_amount) - parseFloat(enr.paid_amount || 0) <= 0 ? (
                                <span className="text-emerald-500 flex items-center gap-0.5">₹0 <span className="text-[9px]">✓ Fully Paid</span></span>
                              ) : (
                                <span className="text-orange-500">₹{(parseFloat(enr.final_amount) - parseFloat(enr.paid_amount || 0)).toLocaleString('en-IN')}</span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Pricing Pending</span>
                        )}
                        {enr.payment_due_date && (
                          <div className="text-[9px] text-muted-foreground/60 flex items-center gap-0.5 mt-1">
                            <Calendar size={10} /> Due: {new Date(enr.payment_due_date).toLocaleDateString()}
                          </div>
                        )}
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
                              {/* STAGE 1: Verify Student Details */}
                              {(currentStatus === 'Pending' || currentStatus === 'pending') && (
                                <button 
                                  onClick={() => handleVerifyStudent(enr.id)}
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary text-white hover:bg-primary/95 text-xs font-bold transition-all shadow-sm shadow-primary/10"
                                >
                                  Verify Details
                                </button>
                              )}

                              {/* STAGE 2: Set Course Amount */}
                              {(currentStatus === 'Reviewing' || currentStatus === 'reviewed') && (
                                <button 
                                  onClick={() => setActiveAssignEnrollment(enr)}
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-orange-500 text-white hover:bg-orange-600 text-xs font-bold transition-all shadow-sm"
                                >
                                  Assign Amount
                                </button>
                              )}

                              {/* STAGE 3: Approve Request */}
                              {currentStatus === 'AmountAssigned' && (
                                <button 
                                  onClick={() => handleApproveEnrollment(enr.id)}
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-500 text-white hover:bg-cyan-600 text-xs font-bold transition-all shadow-sm"
                                >
                                  Approve Request
                                </button>
                              )}

                              {/* STAGE 4: Verify Payment Submitted */}
                              {currentStatus === 'PaymentSubmitted' && (
                                <button 
                                  onClick={() => navigate('/verify-payments')}
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-sm shadow-emerald-500/10"
                                >
                                  Verify Payment
                                </button>
                              )}

                              {/* Reject action visible for all non-final items */}
                              {currentStatus !== 'Enrolled' && currentStatus !== 'Rejected' && (
                                <button 
                                  onClick={() => handleRejectEnrollment(enr.id)}
                                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-all border border-transparent hover:border-red-500/10" 
                                  title="Reject"
                                >
                                  <X size={15} />
                                </button>
                              )}

                              {/* Manual Payment Action */}
                              {enr.final_amount && parseFloat(enr.paid_amount || 0) < parseFloat(enr.final_amount) && currentStatus !== 'Rejected' && (
                                <div className="flex items-center gap-1">
                                  <button 
                                    onClick={() => setActivePaymentEnrollment(enr)}
                                    className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-all border border-transparent hover:border-primary/10" 
                                    title="Record Manual Payment"
                                  >
                                    <Wallet size={15} />
                                  </button>
                                  <button 
                                    onClick={() => setActiveRequestEnrollment(enr)}
                                    className="p-1.5 rounded-lg hover:bg-indigo-500/10 text-indigo-500 transition-all border border-transparent hover:border-indigo-500/10" 
                                    title="Send Payment Request"
                                  >
                                    <Send size={15} />
                                  </button>
                                </div>
                              )}

                              {/* Block / Unblock Access Action */}
                              {(currentStatus === 'Enrolled' || currentStatus === 'enrolled' || enr.status === 'enrolled') && (
                                <button 
                                  onClick={() => setActiveBlockEnrollment(enr)}
                                  className={`p-1.5 rounded-lg transition-all border border-transparent ${
                                    enr.is_blocked 
                                      ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20 shadow-sm shadow-red-500/10' 
                                      : 'hover:bg-red-500/10 text-muted-foreground hover:text-red-500 hover:border-red-500/10'
                                  }`}
                                  title={enr.is_blocked ? "Unblock Course Access" : "Block Course Access"}
                                >
                                  <Ban size={15} />
                                </button>
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
            <button 
              onClick={() => setPage((p) => Math.max(1, p - 1))} 
              disabled={page === 1}
              className="px-3 py-1 rounded-lg border border-border text-xs font-medium hover:bg-muted disabled:opacity-40"
            >
              Previous
            </button>
            <button 
              onClick={() => setPage((p) => p + 1)} 
              disabled={page >= Math.ceil(total / limit)}
              className="px-3 py-1 rounded-lg border border-primary bg-primary text-white text-xs font-medium"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Amount Assignment Modal Panel */}
      <AmountAssignModal 
        isOpen={!!activeAssignEnrollment}
        onClose={() => setActiveAssignEnrollment(null)}
        enrollment={activeAssignEnrollment}
        onUpdate={onEnrollmentUpdated}
      />

      {/* Manual Payment Modal Panel */}
      <ManualPaymentModal 
        isOpen={!!activePaymentEnrollment}
        onClose={() => setActivePaymentEnrollment(null)}
        enrollment={activePaymentEnrollment}
        onUpdate={onEnrollmentUpdated}
      />

      {/* Block Access Modal Panel */}
      <BlockAccessModal 
        isOpen={!!activeBlockEnrollment}
        onClose={() => setActiveBlockEnrollment(null)}
        enrollment={activeBlockEnrollment}
        onUpdate={onEnrollmentUpdated}
      />

      {/* Request Payment Modal Panel */}
      <RequestPaymentModal 
        isOpen={!!activeRequestEnrollment}
        onClose={() => setActiveRequestEnrollment(null)}
        enrollment={activeRequestEnrollment}
        onUpdate={onEnrollmentUpdated}
      />
    </div>
  );
};

export default EnrollmentRequests;
