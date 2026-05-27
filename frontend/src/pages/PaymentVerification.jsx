import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, ShieldAlert, CheckCircle2, XCircle, Eye, 
  Clock, DollarSign, Calendar, Landmark, User, FileText, Loader2 
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../lib/api';
import { cn } from '../lib/utils';

const STATUS_BADGES = {
  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  paid: 'bg-green-500/10 text-green-500 border-green-500/20',
  failed: 'bg-red-500/10 text-red-500 border-red-500/20',
  refunded: 'bg-gray-500/10 text-gray-400 border-gray-500/20'
};

const PaymentVerification = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [filterStatus, setFilterStatus] = useState('pending');

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/payments', {
        params: { status: filterStatus || undefined }
      });
      setPayments(data.data.payments || []);
    } catch (err) {
      toast.error('Failed to fetch payments queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [filterStatus]);

  const handleVerify = async (id, status) => {
    setVerifying(true);
    try {
      await api.patch(`/payments/${id}/verify`, { status, remarks });
      toast.success(`Payment status marked as ${status}`);
      setSelectedPayment(null);
      setRemarks('');
      fetchPayments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setVerifying(false);
    }
  };

  const filtered = payments.filter(p => 
    p.Student?.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.Student?.email?.toLowerCase().includes(search.toLowerCase()) ||
    p.Enrollment?.Course?.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.transaction_ref?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Verification Queue</h1>
          <p className="text-muted-foreground mt-1">
            Review offline UPI / bank proof receipts submitted by students and grant enrollment access.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-xl border border-border">
          {['all', 'pending', 'paid', 'failed'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s === 'all' ? '' : s)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize',
                (filterStatus === s || (s === 'all' && !filterStatus)) 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/5 flex gap-4 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by student, course, tx ref..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-background/50 border border-border rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 size={36} className="animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">No payments in verification queue.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs uppercase text-muted-foreground border-b border-white/5 bg-muted/30">
                  <th className="px-6 py-4 font-semibold">Student</th>
                  <th className="px-6 py-4 font-semibold">Course</th>
                  <th className="px-6 py-4 font-semibold">Amount</th>
                  <th className="px-6 py-4 font-semibold">Payment Mode</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((pay, i) => (
                  <motion.tr 
                    key={pay.id} 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: i * 0.04 }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-sm">{pay.Student?.name || '—'}</div>
                      <div className="text-xs text-muted-foreground">{pay.Student?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium">{pay.Enrollment?.Course?.title || 'Manual Entry'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-primary">
                      ₹{parseFloat(pay.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Landmark size={13} className="text-primary" />
                        {pay.payment_mode || pay.method || 'Manual'}
                      </div>
                      {pay.transaction_ref && (
                        <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">TX: {pay.transaction_ref}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn('px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border', STATUS_BADGES[pay.status])}>
                        {pay.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {new Date(pay.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedPayment(pay)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-white text-xs font-bold transition-all"
                      >
                        <Eye size={14} />
                        Review Proof
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Dialog Drawer */}
      <AnimatePresence>
        {selectedPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card max-w-4xl w-full rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[90vh] border border-border"
            >
              {/* Receipt Image Panel */}
              <div className="flex-1 bg-black/60 p-6 flex flex-col items-center justify-center relative border-b md:border-b-0 md:border-r border-white/10">
                <h3 className="absolute top-4 left-4 text-sm font-semibold text-white/80">Uploaded Screenshot Proof</h3>
                {selectedPayment.proof_url ? (
                  <img 
                    src={`http://localhost:5000${selectedPayment.proof_url}`} 
                    alt="Payment Proof Screenshot"
                    className="max-h-[70vh] object-contain rounded-lg border border-white/10"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/600x800?text=Receipt+Proof+Unavailable';
                    }}
                  />
                ) : (
                  <div className="text-center space-y-2 text-muted-foreground p-8">
                    <ShieldAlert size={48} className="mx-auto text-primary opacity-55 animate-bounce" />
                    <p>No visual proof screenshot was submitted for this payment.</p>
                  </div>
                )}
              </div>

              {/* Action Details Panel */}
              <div className="w-full md:w-[380px] p-6 flex flex-col justify-between overflow-y-auto">
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold tracking-tight">Review Transaction</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">Reference ID: #{selectedPayment.id}</p>
                    </div>
                    <button 
                      onClick={() => setSelectedPayment(null)}
                      className="p-1 rounded-lg hover:bg-white/15 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Close
                    </button>
                  </div>

                  {/* Details Card */}
                  <div className="space-y-3 bg-muted/30 p-4 rounded-xl border border-white/5 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center gap-1.5"><User size={14} /> Student:</span>
                      <span className="font-semibold text-right">{selectedPayment.Student?.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center gap-1.5"><FileText size={14} /> Course:</span>
                      <span className="font-semibold text-right max-w-[180px] truncate">{selectedPayment.Enrollment?.Course?.title}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center gap-1.5"><DollarSign size={14} /> Amount:</span>
                      <span className="font-black text-primary">₹{parseFloat(selectedPayment.amount).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center gap-1.5"><Landmark size={14} /> Method:</span>
                      <span className="font-semibold">{selectedPayment.payment_mode || selectedPayment.method}</span>
                    </div>
                    {selectedPayment.transaction_ref && (
                      <div className="flex justify-between items-center pt-2 border-t border-white/5">
                        <span className="text-muted-foreground text-xs font-mono">TX REF:</span>
                        <span className="font-semibold text-xs font-mono select-all bg-background px-1.5 py-0.5 rounded border border-border">{selectedPayment.transaction_ref}</span>
                      </div>
                    )}
                  </div>

                  {/* Remarks Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-muted-foreground">Admin Notes / Remarks</label>
                    <textarea 
                      placeholder="Add validation remarks, reasons for rejection, or manual receipts details..."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all h-24 resize-none"
                    />
                  </div>
                </div>

                {/* Confirm Action Panel */}
                <div className="mt-8 pt-4 border-t border-white/5 space-y-2.5">
                  {selectedPayment.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleVerify(selectedPayment.id, 'paid')}
                        disabled={verifying}
                        className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
                      >
                        {verifying ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                        Approve & Enroll Student
                      </button>
                      <button
                        onClick={() => handleVerify(selectedPayment.id, 'failed')}
                        disabled={verifying}
                        className="w-full py-3 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-bold transition-all border border-red-500/20 flex items-center justify-center gap-2"
                      >
                        <XCircle size={18} />
                        Reject Proof Receipt
                      </button>
                    </>
                  ) : (
                    <div className="text-center py-2 text-xs font-semibold text-muted-foreground bg-muted/20 border border-white/5 rounded-xl">
                      Already Marked as <span className="uppercase text-primary">{selectedPayment.status}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PaymentVerification;
