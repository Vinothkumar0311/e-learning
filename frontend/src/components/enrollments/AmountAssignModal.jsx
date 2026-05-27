import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Percent, Calendar, FileText, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../lib/api';

const AmountAssignModal = ({ isOpen, onClose, enrollment, onUpdate }) => {
  const [finalAmount, setFinalAmount] = useState('');
  const [discountAmount, setDiscountAmount] = useState('0');
  const [dueDate, setDueDate] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (enrollment) {
      setFinalAmount(enrollment.Course?.price || '');
      setDiscountAmount('0');
      // Set default due date to 7 days from now
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 7);
      setDueDate(defaultDate.toISOString().substring(0, 10));
      setAdminNotes('');
    }
  }, [enrollment]);

  if (!isOpen || !enrollment) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        final_amount: parseFloat(finalAmount),
        discount_amount: parseFloat(discountAmount),
        payment_due_date: new Date(dueDate),
        admin_notes: adminNotes
      };
      
      const { data } = await api.patch(`/enrollments/${enrollment.id}/set-amount`, payload);
      toast.success('Amount assigned successfully');
      onUpdate(enrollment.id, data.data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign fee');
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

        <h3 className="text-xl font-bold tracking-tight mb-1 text-foreground">Assign Course Fee</h3>
        <p className="text-xs text-muted-foreground mb-6">
          Set the pricing parameters and payment schedule for <span className="font-semibold text-primary">{enrollment.Student?.name}</span>.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Base Course Price info */}
          <div className="flex justify-between items-center bg-muted/40 px-3 py-2.5 rounded-xl border border-white/5 text-xs text-muted-foreground">
            <span>Base Course Price:</span>
            <span className="font-bold text-foreground">₹{parseFloat(enrollment.Course?.price || 0).toLocaleString()}</span>
          </div>

          {/* Final Amount */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <DollarSign size={13} /> Final Amount (₹)
            </label>
            <input 
              type="number"
              required
              min="0"
              value={finalAmount}
              onChange={(e) => setFinalAmount(e.target.value)}
              className="w-full bg-background border border-border rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold"
            />
          </div>

          {/* Discount Amount */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Percent size={13} /> Applied Discount (₹)
            </label>
            <input 
              type="number"
              min="0"
              value={discountAmount}
              onChange={(e) => setDiscountAmount(e.target.value)}
              className="w-full bg-background border border-border rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-green-500 font-semibold"
            />
          </div>

          {/* Due Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Calendar size={13} /> Payment Due Date
            </label>
            <input 
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-background border border-border rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-muted-foreground"
            />
          </div>

          {/* Admin Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <FileText size={13} /> Student Notes / Instructions
            </label>
            <textarea 
              placeholder="e.g. This includes manual course material package fee."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
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
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white text-sm font-bold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-1.5"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
              Assign & Request
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AmountAssignModal;
