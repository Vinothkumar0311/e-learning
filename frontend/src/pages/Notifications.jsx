import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Send, 
  Plus, 
  Clock, 
  CheckCircle2,
  Users,
  Smartphone,
  Info,
  AlertCircle,
  X,
  Sparkles
} from 'lucide-react';
import { cn } from '../lib/utils';
import api from '../lib/api';
import { toast } from 'sonner';

const Notifications = () => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Form states
  const [notifType, setNotifType] = useState('push');
  const [recipientGroup, setRecipientGroup] = useState('All Registered Students');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  // Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Fetch sent history on load
  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/notifications');
      if (res.data && res.data.success) {
        setHistory(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load notification history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Pre-validate form and open custom popup
  const handleOpenConfirm = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a notification title');
      return;
    }
    if (!message.trim()) {
      toast.error('Please enter notification message content');
      return;
    }
    setShowConfirmModal(true);
  };

  // Submit actual broadcast to backend
  const handleSendBroadcast = async () => {
    try {
      setIsSending(true);
      const payload = {
        type: notifType,
        title: title.trim(),
        message: message.trim(),
        recipient_group: recipientGroup,
        status: 'sent'
      };

      const res = await api.post('/notifications', payload);
      if (res.data && res.data.success) {
        toast.success(`Success! Broadcast sent via ${notifType.toUpperCase()}`);
        setTitle('');
        setMessage('');
        setShowConfirmModal(false);
        // Refresh history list
        fetchHistory();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to dispatch notification broadcast');
    } finally {
      setIsSending(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'push': return Smartphone;
      case 'email': return Mail;
      case 'sms': return MessageSquare;
      default: return Bell;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications Center</h1>
          <p className="text-muted-foreground mt-1">Broadcast direct updates, emails, and SMS alerts to your student community.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Composer */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-8 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
              <Bell size={240} className="text-primary" />
            </div>

            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Plus size={20} className="text-primary" />
              New Notification Composer
            </h2>
            
            <form onSubmit={handleOpenConfirm} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Dispatch Method</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { id: 'push', icon: Smartphone, label: 'Push Notification', color: 'text-indigo-500' },
                    { id: 'email', icon: Mail, label: 'Email Broadcast', color: 'text-violet-500' },
                    { id: 'sms', icon: MessageSquare, label: 'SMS Alert', color: 'text-pink-500' },
                  ].map((type) => {
                    const IconComp = type.icon;
                    return (
                      <button 
                        type="button"
                        key={type.id}
                        onClick={() => setNotifType(type.id)}
                        className={cn(
                          "flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all hover:scale-[1.02]",
                          notifType === type.id 
                            ? "border-primary bg-primary/5 text-primary shadow-md shadow-primary/5" 
                            : "border-border hover:border-primary/20 bg-card"
                        )}
                      >
                        <IconComp size={28} className={cn(notifType === type.id ? 'text-primary' : type.color)} />
                        <span className="text-[11px] font-extrabold uppercase tracking-wider">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Recipient Group</label>
                  <select 
                    value={recipientGroup}
                    onChange={(e) => setRecipientGroup(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold"
                  >
                    <option>All Registered Students</option>
                    <option>Enrolled Students Only</option>
                    <option>Students with Outstanding Balances</option>
                    <option>Batch A (Data Structures & Algorithms)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Notification Title</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Live Class starting in 15 minutes!"
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Message Content</label>
                  <textarea 
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter the detailed description students will see on their mobile device or email inbox..."
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none font-medium"
                  ></textarea>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-lg border border-border">
                    <Info size={14} className="text-primary" />
                    A confirmation preview popup will appear next.
                  </div>
                  
                  <button 
                    type="submit"
                    className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-white hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 active:scale-95 transition-all font-bold"
                  >
                    <Send size={18} />
                    Send Notification Now
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Recent History */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-3xl h-[610px] flex flex-col">
            <h3 className="font-bold mb-6 flex items-center gap-2 border-b border-border pb-4">
              <CheckCircle2 size={18} className="text-green-500" />
              Recently Broadcasted Logs
            </h3>
            
            <div className="space-y-4 flex-1 overflow-y-auto pr-1">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground p-4">
                  <Bell size={36} className="text-muted-foreground/30 mb-2" />
                  <p className="text-xs font-bold uppercase tracking-wider">No notifications sent yet</p>
                </div>
              ) : (
                history.map((item, i) => {
                  const Icon = getIcon(item.type);
                  return (
                    <motion.div 
                      key={item.id || i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-4 rounded-2xl bg-card border border-border group hover:border-primary/20 transition-all hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className={cn(
                          "px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1",
                          item.type === 'email' ? "bg-violet-500/10 text-violet-500" : 
                          item.type === 'sms' ? "bg-pink-500/10 text-pink-500" : "bg-indigo-500/10 text-indigo-500"
                        )}>
                          <Icon size={10} />
                          {item.type}
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground">
                          {new Date(item.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} at {new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-sm mb-1 group-hover:text-primary transition-colors line-clamp-1">{item.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3">{item.message}</p>
                      
                      <div className="flex items-center justify-between border-t border-border/50 pt-2.5 mt-2.5">
                        <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                          <Users size={12} className="text-primary" /> {item.recipient_group}
                        </span>
                        <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-md uppercase flex items-center gap-0.5">
                          <CheckCircle2 size={10} /> {item.status}
                        </span>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          🎓 STUNNING CUSTOM PREVIEW & CONFIRMATION POPUP MODAL
          ======================================================== */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Dark overlay backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Body Container */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-4xl bg-card border border-border/80 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 z-10"
            >
              {/* Left Column: Live Mockup Preview */}
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-8 flex flex-col justify-between text-white relative">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.15),transparent)] pointer-events-none" />
                
                {/* Header info */}
                <div className="relative">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-bold text-indigo-200 backdrop-blur-md mb-4">
                    <Sparkles size={13} className="text-yellow-400" />
                    Interactive Simulator
                  </div>
                  <h3 className="text-2xl font-black tracking-tight leading-tight">Live Student Device Preview</h3>
                  <p className="text-xs text-indigo-200/60 mt-1">Real-time simulation of the student client view.</p>
                </div>

                {/* Device Frame */}
                <div className="my-8 flex justify-center relative">
                  <div className="w-[280px] h-[340px] rounded-[36px] bg-slate-950 border-[8px] border-slate-800 shadow-2xl relative overflow-hidden flex flex-col">
                    {/* Device Camera Notch */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 rounded-full bg-slate-800 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-950" />
                    </div>

                    {/* Notification Alert Box */}
                    {notifType === 'push' && (
                      <div className="p-4 pt-10 flex-1 flex flex-col justify-start">
                        <motion.div 
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.15 }}
                          className="w-full bg-slate-900/90 border border-white/10 rounded-2xl p-3 shadow-lg flex gap-3 backdrop-blur-md"
                        >
                          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-md shadow-primary/20">
                            <Bell size={18} className="text-white" />
                          </div>
                          <div className="overflow-hidden">
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                              <span className="text-[11px] font-black text-indigo-300">EDUSTUDENT</span>
                              <span className="text-[9px] font-bold text-white/40">now</span>
                            </div>
                            <h5 className="text-[12px] font-black text-white line-clamp-1">{title || 'Your Notification Title'}</h5>
                            <p className="text-[10px] text-white/70 mt-0.5 line-clamp-3 leading-relaxed">{message || 'Your message content will appear here...'}</p>
                          </div>
                        </motion.div>
                      </div>
                    )}

                    {notifType === 'email' && (
                      <div className="p-4 pt-10 flex-1 flex flex-col justify-start overflow-hidden bg-slate-900">
                        {/* Simulated Email App */}
                        <div className="flex items-center gap-2 border-b border-white/10 pb-2 mb-3">
                          <Mail size={14} className="text-indigo-400" />
                          <span className="text-[10px] font-black tracking-widest text-white/50">INBOX</span>
                        </div>
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="bg-slate-950/80 border border-white/5 rounded-xl p-3"
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[9px] font-bold text-indigo-400">EduPlatform Support</span>
                            <span className="text-[8px] text-white/30">Just now</span>
                          </div>
                          <h6 className="text-[11px] font-black text-white line-clamp-1">{title || 'Subject Line'}</h6>
                          <div className="w-full h-[1px] bg-white/5 my-1.5" />
                          <p className="text-[9px] text-white/60 line-clamp-4 leading-relaxed whitespace-pre-line">{message || 'Email contents...'}</p>
                        </motion.div>
                      </div>
                    )}

                    {notifType === 'sms' && (
                      <div className="p-4 pt-10 flex-1 flex flex-col justify-end bg-slate-900">
                        {/* Simulated Messenger App */}
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-indigo-600 rounded-2xl rounded-br-none p-3 shadow-md ml-8 text-white"
                        >
                          <div className="text-[8px] font-extrabold opacity-60 mb-0.5 uppercase tracking-wide">SMS Broadcast</div>
                          <p className="text-[10px] leading-relaxed font-semibold">{message || 'SMS alert text content...'}</p>
                        </motion.div>
                        <div className="text-[8px] text-white/30 text-right mt-1.5 mr-1 font-bold">Sent to {recipientGroup}</div>
                      </div>
                    )}

                    {/* Bottom Home Indicator */}
                    <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-24 h-1 rounded-full bg-slate-700" />
                  </div>
                </div>

                {/* Footer note */}
                <div className="text-[11px] text-indigo-200/50 flex items-center gap-1.5 relative">
                  <AlertCircle size={12} className="text-indigo-400" />
                  This simulation accurately mimics responsive aspect layouts.
                </div>
              </div>

              {/* Right Column: Execution Form */}
              <div className="p-8 flex flex-col justify-between bg-card text-foreground">
                {/* Header & close */}
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-[10px] font-black tracking-widest text-primary uppercase bg-primary/10 px-2.5 py-1 rounded-md">Step 2: Confirm Broadcast</span>
                      <h4 className="text-xl font-bold mt-2">Verify Details before Dispatch</h4>
                    </div>
                    <button 
                      onClick={() => setShowConfirmModal(false)}
                      className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Summary Box */}
                  <div className="space-y-4 py-4">
                    <div className="p-4 rounded-2xl bg-muted/50 border border-border space-y-3.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-muted-foreground">Recipient Group:</span>
                        <span className="font-extrabold text-foreground bg-background px-3 py-1 rounded-lg border border-border">{recipientGroup}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-muted-foreground">Broadcast Mode:</span>
                        <span className="font-extrabold text-primary capitalize bg-primary/10 px-3 py-1 rounded-lg flex items-center gap-1.5">
                          {React.createElement(getIcon(notifType), { size: 13 })}
                          {notifType}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-muted-foreground">Title Header:</span>
                        <span className="font-extrabold text-foreground line-clamp-1 max-w-[200px]">{title}</span>
                      </div>
                    </div>

                    <div className="p-4 bg-orange-500/5 border border-orange-500/15 rounded-2xl flex gap-3 text-xs text-orange-600 dark:text-orange-400">
                      <AlertCircle size={18} className="shrink-0 mt-0.5 text-orange-500" />
                      <div>
                        <p className="font-extrabold uppercase tracking-wider text-[10px]">Important Broadcast Warning</p>
                        <p className="mt-1 leading-relaxed opacity-90">Confirming this action will instantly dispatch the notification content via active channels to all members in the group.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex gap-4 border-t border-border pt-6 mt-6">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1 py-3 px-4 rounded-xl border border-border hover:bg-muted text-sm font-bold transition-all text-muted-foreground"
                  >
                    Cancel & Modify
                  </button>
                  
                  <button
                    onClick={handleSendBroadcast}
                    disabled={isSending}
                    className="flex-1 py-3 px-4 rounded-xl bg-primary text-white hover:bg-primary/90 font-bold transition-all flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50"
                  >
                    {isSending ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <Send size={16} />
                        Confirm & Send
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Notifications;
