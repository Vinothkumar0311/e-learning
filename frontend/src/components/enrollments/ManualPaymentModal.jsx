import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Wallet, FileText, Loader2, X, Info } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../lib/api';

const ManualPaymentModal = ({ isOpen, onClose, enrollment, onUpdate }) => {
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (enrollment) {
      const remaining = Math.max(
        0,
        parseFloat(enrollment.final_amount || 0) - parseFloat(enrollment.paid_amount || 0)
      );
      setAmountPaid(remaining.toString());
      setRemarks('');
    }
  }, [enrollment]);

  if (!isOpen || !enrollment) return null;

  const remaining = Math.max(
    0,
    parseFloat(enrollment.final_amount || 0) - parseFloat(enrollment.paid_amount || 0)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amountPaid || parseFloat(amountPaid) <= 0) {
      toast.error('Please enter a valid amount paid');
      return;
    }
    if (parseFloat(amountPaid) > remaining) {
      toast.error(`Paid amount cannot exceed the remaining balance of ₹${remaining}`);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        amount_paid: parseFloat(amountPaid),
        payment_mode: paymentMode,
        remarks: remarks || `Manual payment recorded by Admin (${paymentMode})`
      };

      const { data } = await api.post(`/enrollments/${enrollment.id}/record-payment`, payload);
      toast.success('Payment recorded successfully!');
      
      if (onUpdate) {
        onUpdate(enrollment.id, data.data);
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-card max-w-md w-full rounded-2xl border border-white/10 shadow-2xl p-6 relative overflow-hidden"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={18} />
        </button>

        <h3 className="text-xl font-bold tracking-tight mb-1 text-foreground flex items-center gap-2">
          <Wallet className="text-primary" size={22} />
          Record Manual Payment
        </h3>
        <p className="text-xs text-muted-foreground mb-6">
          Manually enter details of cash, check, or online bank transfer received from <span className="font-semibold text-primary">{enrollment.Student?.name}</span>.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Balance Breakdown info */}
          <div className="space-y-2 bg-muted/40 p-4 rounded-xl border border-white/5 text-xs text-muted-foreground">
            <div className="flex justify-between items-center">
              <span>Final Course Fee:</span>
              <span className="font-bold text-foreground">₹{parseFloat(enrollment.final_amount || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-green-500">
              <span>Total Paid So Far:</span>
              <span className="font-bold">₹{parseFloat(enrollment.paid_amount || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-white/5 font-semibold text-primary text-sm">
              <span>Remaining Balance:</span>
              <span>₹{remaining.toLocaleString()}</span>
            </div>
          </div>

          {/* Amount Paid input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <CreditCard size={13} /> Amount Paid (₹)
            </label>
            <input 
              type="number"
              required
              min="1"
              max={remaining}
              step="0.01"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              className="w-full bg-background border border-border rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold text-primary"
            />
          </div>

          {/* Payment Mode select */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Info size={13} /> Payment Mode
            </label>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="w-full bg-background border border-border rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
            >
              <option value="Cash">💵 Cash</option>
              <option value="UPI">📱 UPI/GPay/PhonePe</option>
              <option value="Bank Transfer">🏦 Direct Bank Transfer</option>
              <option value="Check">📝 Check</option>
            </select>
          </div>

          {/* Remarks */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <FileText size={13} /> Payment Note / Reference
            </label>
            <textarea 
              placeholder="e.g. Received by cash in office, txn id, or bank ref code"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full bg-background border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all h-20 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-muted/50 hover:bg-muted text-muted-foreground text-sm font-semibold border border-white/5 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={submitting || remaining <= 0}
              className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white text-sm font-bold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-1.5"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
              Submit Payment
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ManualPaymentModal;
