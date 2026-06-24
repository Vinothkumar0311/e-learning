import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus, Search, BookOpen, X, Check, Trash2, Loader2,
  Phone, Mail, User, KeyRound, Copy, CheckCheck, ChevronRight,
  GraduationCap, AlertCircle, Users, BookMarked
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../lib/api';
import { cn } from '../lib/utils';

// ─── Add Student Modal ────────────────────────────────────────────────────────
const AddStudentModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({ name: '', email: '', mobile_number: '' });
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.mobile_number.trim()) {
      toast.error('Name and Mobile Number are required');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/students/create', form);
      setCreated(data.data);
      onCreated();
      toast.success('Student admission created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create student');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="relative w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl z-10 overflow-hidden"
      >
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">New Student Admission</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Credentials auto-generated from provided details</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted transition-all">
            <X size={18} />
          </button>
        </div>

        {!created ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Full Name *</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text" required placeholder="e.g. Vinothkumar S"
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Mobile Number * <span className="normal-case text-primary">(used as password)</span></label>
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="tel" required placeholder="e.g. 9876543210"
                  value={form.mobile_number} onChange={e => setForm(f => ({ ...f, mobile_number: e.target.value }))}
                  className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email" placeholder="e.g. student@example.com"
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl flex gap-2 text-xs text-primary">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <p>The student will log in to the mobile app using their <strong>Full Name</strong> as username and <strong>Mobile Number</strong> as password.</p>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <><UserPlus size={18} /> Create Admission</>}
            </button>
          </form>
        ) : (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-green-500/10 border border-green-500/20">
              <Check size={30} className="text-green-500" />
            </div>
            <h4 className="text-center font-bold text-lg">Admission Created!</h4>
            <p className="text-center text-sm text-muted-foreground">Share these login credentials with the student</p>

            <div className="bg-muted/50 border border-border rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Full Name (Username)</p>
                  <p className="font-bold text-sm mt-0.5">{created.name}</p>
                </div>
              </div>
              <div className="w-full h-px bg-border" />
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Password</p>
                  <p className="font-bold text-sm mt-0.5">{created.mobile_number}</p>
                </div>
                <button onClick={() => handleCopy(`Username: ${created.name}\nPassword: ${created.mobile_number}`)}
                  className="p-2 rounded-xl hover:bg-background border border-border transition-all">
                  {copied ? <CheckCheck size={15} className="text-green-500" /> : <Copy size={15} />}
                </button>
              </div>
            </div>

            <div className="p-3 bg-orange-500/5 border border-orange-500/20 rounded-xl text-xs text-orange-600 dark:text-orange-400">
              <strong>Remind the student</strong> to change their password after first login.
            </div>

            <button onClick={onClose} className="w-full py-2.5 rounded-xl border border-border text-sm font-bold hover:bg-muted transition-all">
              Done
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

// ─── Assign Courses Panel ─────────────────────────────────────────────────────
const AssignCoursesPanel = ({ student, onClose, onUpdated }) => {
  const [allCourses, setAllCourses] = useState([]);
  const [assigned, setAssigned] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [removing, setRemoving] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingCourses(true);
      try {
        const [coursesRes, assignedRes] = await Promise.all([
          api.get('/courses', { params: { limit: 100 } }),
          api.get(`/students/${student.id}/assigned-courses`)
        ]);
        // Admin /courses returns { courses: [...], total, pages }
        const coursesData = coursesRes.data.data;
        setAllCourses(coursesData?.courses || coursesData || []);
        setAssigned(assignedRes.data.data?.assignments || []);
      } catch {
        toast.error('Failed to load course data');
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchData();
  }, [student.id]);

  const assignedCourseIds = new Set(assigned.map(a => a.course_id));
  const availableCourses = allCourses.filter(c => !assignedCourseIds.has(c.id));

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleAssign = async () => {
    if (selected.length === 0) { toast.error('Select at least one course'); return; }
    setAssigning(true);
    try {
      const { data } = await api.post(`/students/${student.id}/assign-courses`, { course_ids: selected });
      setAssigned(data.data || []);
      setSelected([]);
      onUpdated();
      toast.success(`${selected.length} course(s) assigned!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Assignment failed');
    } finally {
      setAssigning(false);
    }
  };

  const handleRemove = async (courseId) => {
    setRemoving(courseId);
    try {
      await api.delete(`/students/${student.id}/assigned-courses/${courseId}`);
      setAssigned(prev => prev.filter(a => a.course_id !== courseId));
      onUpdated();
      toast.success('Course removed from student');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove');
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="relative w-full max-w-2xl bg-card border border-border rounded-3xl shadow-2xl z-10 overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-lg font-bold">Assign Courses</h3>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">
                {student.name?.charAt(0).toUpperCase()}
              </span>
              {student.name} · {student.mobile_number || student.phone}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted transition-all"><X size={18} /></button>
        </div>

        <div className="overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
          {/* Left: Available courses to assign */}
          <div className="p-5 flex flex-col gap-3">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Available Courses</p>
            {loadingCourses ? (
              <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-primary" /></div>
            ) : availableCourses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-xs font-semibold">All courses already assigned</p>
              </div>
            ) : (
              <div className="space-y-2">
                {availableCourses.map(course => {
                  const isSelected = selected.includes(course.id);
                  return (
                    <button key={course.id} onClick={() => toggleSelect(course.id)}
                      className={cn(
                        'w-full text-left p-3 rounded-xl border-2 transition-all flex items-center gap-3',
                        isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30 bg-background'
                      )}>
                      <div className={cn('w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all',
                        isSelected ? 'bg-primary border-primary' : 'border-border')}>
                        {isSelected && <Check size={12} className="text-white" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate">{course.title}</p>
                        <p className="text-[10px] text-muted-foreground capitalize">{course.level} · ₹{Number(course.price).toLocaleString('en-IN')}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            {selected.length > 0 && (
              <button onClick={handleAssign} disabled={assigning}
                className="mt-2 w-full py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                {assigning ? <Loader2 size={16} className="animate-spin" /> : <><Check size={16} /> Assign {selected.length} Course{selected.length > 1 ? 's' : ''}</>}
              </button>
            )}
          </div>

          {/* Right: Currently assigned courses */}
          <div className="p-5 flex flex-col gap-3">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Assigned Courses <span className="text-primary">({assigned.length})</span>
            </p>
            {assigned.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <GraduationCap size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-xs font-semibold">No courses assigned yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {assigned.map(a => (
                  <div key={a.id} className="p-3 rounded-xl border border-green-500/20 bg-green-500/5 flex items-center gap-3">
                    <div className="w-5 h-5 rounded-md bg-green-500 flex items-center justify-center shrink-0">
                      <Check size={12} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{a.Course?.title}</p>
                      <p className="text-[10px] text-muted-foreground capitalize">{a.Course?.level}</p>
                    </div>
                    <button onClick={() => handleRemove(a.course_id)} disabled={removing === a.course_id}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-all text-muted-foreground">
                      {removing === a.course_id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Main Admissions Page ─────────────────────────────────────────────────────
const Admissions = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [assignTarget, setAssignTarget] = useState(null);
  const limit = 15;

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit, ...(search && { search }) };
      const { data } = await api.get('/students', { params });
      setStudents(data.data.students);
      setTotal(data.data.total);
    } catch {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const handleToggleStatus = async (student) => {
    try {
      const { data } = await api.patch(`/students/${student.id}/toggle-status`);
      setStudents(prev => prev.map(s => s.id === student.id ? data.data : s));
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admissions & Access Control</h1>
          <p className="text-muted-foreground mt-1">
            Create student admissions and assign course access.{' '}
            <span className="font-semibold text-primary">{total} total students.</span>
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 transition-all"
        >
          <UserPlus size={18} />
          New Admission
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Students', value: total, icon: Users, color: 'text-blue-500' },
          { label: 'Active', value: students.filter(s => s.is_active).length, icon: GraduationCap, color: 'text-green-500' },
          { label: 'Inactive', value: students.filter(s => !s.is_active).length, icon: AlertCircle, color: 'text-red-500' },
        ].map(stat => (
          <div key={stat.label} className="glass-card rounded-xl p-4 flex items-center gap-3">
            <span className={stat.color}><stat.icon size={18} /></span>
            <div>
              <div className="text-xl font-black">{stat.value}</div>
              <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="glass-card p-4 rounded-2xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text" placeholder="Search by name, email, or mobile..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-background border border-border rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      {/* Student list */}
      {loading ? (
        <div className="flex items-center justify-center h-64"><Loader2 size={40} className="animate-spin text-primary" /></div>
      ) : students.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          <Users size={48} className="mx-auto mb-4 opacity-30" />
          <p className="font-semibold">No students found</p>
          <p className="text-sm mt-1">Create the first admission using the button above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {students.map((student, i) => (
            <motion.div key={student.id}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              className={cn('glass-card p-4 rounded-2xl group transition-all duration-300',
                student.is_active ? 'hover:border-primary/30' : 'opacity-60 border-red-500/10')}>
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                {/* Avatar */}
                <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 font-bold text-lg',
                  student.is_active ? 'bg-gradient-to-tr from-primary/20 to-secondary/20 border-white/10 text-primary'
                    : 'bg-muted border-border text-muted-foreground')}>
                  {student.name?.charAt(0)?.toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold group-hover:text-primary transition-colors truncate">{student.name}</h3>
                    <span className={cn('px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border shrink-0',
                      student.is_active ? 'bg-green-500/10 text-green-500 border-green-500/20'
                        : 'bg-red-500/10 text-red-500 border-red-500/20')}>
                      {student.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <User size={11} /> Username: {student.name}
                    </span>
                    {student.mobile_number && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Phone size={11} /> Mobile: {student.mobile_number}
                      </span>
                    )}
                    {student.email && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail size={11} /> {student.email}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <KeyRound size={11} /> Password: {student.mobile_number || '—'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setAssignTarget(student)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border bg-primary/10 text-primary border-primary/20 hover:bg-primary hover:text-white transition-all"
                  >
                    <BookMarked size={13} /> Assign Courses
                  </button>
                  <button
                    onClick={() => handleToggleStatus(student)}
                    className={cn('px-3 py-1.5 rounded-xl text-xs font-bold border transition-all',
                      student.is_active
                        ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white'
                        : 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500 hover:text-white')}>
                    {student.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > limit && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted disabled:opacity-40 transition-all">Previous</button>
          <span className="text-sm text-muted-foreground px-4">Page {page} of {Math.ceil(total / limit)}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / limit)}
            className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted disabled:opacity-40 transition-all">Next</button>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence mode="wait">
        {showAddModal && (
          <AddStudentModal
            key="add-student-modal"
            onClose={() => setShowAddModal(false)}
            onCreated={() => { fetchStudents(); }}
          />
        )}
        {assignTarget && (
          <AssignCoursesPanel
            key={`assign-${assignTarget.id}`}
            student={assignTarget}
            onClose={() => setAssignTarget(null)}
            onUpdated={fetchStudents}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Admissions;
