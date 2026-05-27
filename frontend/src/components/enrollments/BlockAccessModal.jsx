import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, ShieldCheck, FileText, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../lib/api';

const BlockAccessModal = ({ isOpen, onClose, enrollment, onUpdate }) => {
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (enrollment) {
      setIsBlocked(enrollment.is_blocked || false);
      setBlockReason(enrollment.block_reason || '');
    }
  }, [enrollment]);

  if (!isOpen || !enrollment) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        is_blocked: isBlocked,
        block_reason: isBlocked ? (blockReason || 'Access suspended by Administrator') : null
      };

      const { data } = await api.patch(`/enrollments/${enrollment.id}/block`, payload);
      toast.success(
        isBlocked 
          ? 'Student course access has been suspended!' 
          : 'Student course access has been restored!'
      );
      
      if (onUpdate) {
        onUpdate(enrollment.id, data.data);
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update access status');
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
          {isBlocked ? (
            <ShieldAlert className="text-red-500 animate-pulse" size={24} />
          ) : (
            <ShieldCheck className="text-green-500" size={24} />
          )}
          Manage Course Access
        </h3>
        <p className="text-xs text-muted-foreground mb-6">
          Suspend or restore course content access for <span className="font-semibold text-primary">{enrollment.Student?.name}</span> in <span className="font-semibold text-primary">{enrollment.Course?.title}</span>.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Access Switcher */}
          <div className="flex items-center justify-between bg-muted/40 p-4 rounded-xl border border-white/5">
            <span className="text-sm font-semibold text-foreground">
              {isBlocked ? '🔴 Access Suspended (Blocked)' : '🟢 Active Access (Enrolled)'}
            </span>
            <button
              type="button"
              onClick={() => setIsBlocked(!isBlocked)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-all duration-300 ${
                isBlocked ? 'bg-red-500 justify-end' : 'bg-green-500 justify-start'
              }`}
            >
              <motion.div 
                layout 
                className="w-4 h-4 rounded-full bg-white shadow-md"
              />
            </button>
          </div>

          {/* Block Reason field - only visible if isBlocked is true */}
          {isBlocked && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-1.5"
            >
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <FileText size={13} /> Reason for Suspension
              </label>
              <textarea 
                placeholder="e.g. Fees pending / failed installment deadline. This will be shown to the student."
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                required
                className="w-full bg-background border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all h-24 resize-none"
              />
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-white/5">
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
              className={`flex-1 py-2.5 rounded-xl text-white text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-1.5 ${
                isBlocked 
                  ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' 
                  : 'bg-green-500 hover:bg-green-600 shadow-green-500/20'
              }`}
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
              Apply Access Settings
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default BlockAccessModal;
