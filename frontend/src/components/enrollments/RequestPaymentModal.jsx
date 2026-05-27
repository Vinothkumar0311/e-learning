import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, AlertCircle, Sparkles, Loader2, DollarSign } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';

const RequestPaymentModal = ({ isOpen, onClose, enrollment, onUpdate }) => {
  const [requestedAmount, setRequestedAmount] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);

  const finalFee = enrollment ? parseFloat(enrollment.final_amount || enrollment.Course?.price || 0) : 0;
  const paidAmount = enrollment ? parseFloat(enrollment.paid_amount || 0) : 0;
  const remaining = Math.max(0, finalFee - paidAmount);

  useEffect(() => {
    if (enrollment) {
      setRequestedAmount(remaining.toString());
      setRemarks(`Remaining balance request for course: ${enrollment.Course?.title}`);
    }
  }, [enrollment, remaining]);

  if (!isOpen || !enrollment) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amountVal = parseFloat(requestedAmount);

    if (isNaN(amountVal) || amountVal <= 0) {
      toast.error('Please enter a valid amount greater than 0');
      return;
    }

    if (amountVal > remaining) {
      toast.error(`Request amount cannot exceed remaining balance (₹${remaining})`);
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post(`/enrollments/${enrollment.id}/request-payment`, {
        amount: amountVal,
        remarks
      });

      if (data.success) {
        toast.success(`Successfully sent payment request for ₹${amountVal}!`);
        if (onUpdate) {
          onUpdate(enrollment.id, data.data);
        }
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit payment request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md overflow-hidden bg-card border border-white/10 rounded-3xl shadow-2xl p-6"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-muted/50 hover:bg-muted text-muted-foreground transition-colors"
          >
            <X size={18} />
          </button>

          {/* Heading */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 text-primary rounded-2xl">
              <Send size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-1.5">
                Send Payment Request <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              </h2>
              <p className="text-xs text-muted-foreground">Request installment or outstanding balance from student.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Context Info */}
            <div className="space-y-2.5 p-4 rounded-2xl bg-muted/40 border border-white/5 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Student:</span>
                <span className="font-bold text-foreground">{enrollment.Student?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Course:</span>
                <span className="font-semibold text-foreground text-right max-w-[200px] truncate">{enrollment.Course?.title}</span>
              </div>
              <hr className="border-white/5 my-1" />
              <div className="flex justify-between">
                <span>Total Final Fee:</span>
                <span className="font-bold text-foreground">₹{finalFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-500">
                <span>Amount Already Paid:</span>
                <span className="font-bold">₹{paidAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-primary font-bold text-sm pt-0.5 border-t border-dashed border-white/10">
                <span>Outstanding Balance:</span>
                <span>₹{remaining.toLocaleString()}</span>
              </div>
            </div>

            {/* Requested Amount Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Request Amount (₹)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">₹</span>
                <input
                  type="number"
                  required
                  placeholder="0.00"
                  value={requestedAmount}
                  onChange={(e) => setRequestedAmount(e.target.value)}
                  className="w-full bg-background border border-border rounded-2xl py-3 pl-8 pr-4 text-sm font-black focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                />
              </div>
            </div>

            {/* Remarks / Message Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Request Notes / Remarks</label>
              <textarea
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Include a message for the student..."
                className="w-full bg-background border border-border rounded-2xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-2xl border border-border hover:bg-muted text-sm font-semibold text-muted-foreground transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 rounded-2xl bg-primary text-white hover:bg-primary/95 transition-all text-sm font-semibold flex items-center justify-center gap-1.5 shadow-lg shadow-primary/20"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <>
                    <Send size={16} />
                    Send Request
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RequestPaymentModal;
