import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, UserPlus, Mail, Calendar, Eye, ToggleLeft, ToggleRight, Trash2, Loader2, X, UserCheck, UserX } from 'lucide-react';
import { toast } from 'sonner';
import api from '../lib/api';
import { cn } from '../lib/utils';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 15;

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit, ...(search && { search }), ...(statusFilter && { status: statusFilter }) };
      const { data } = await api.get('/students', { params });
      setStudents(data.data.students);
      setTotal(data.data.total);
    } catch {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const handleToggleStatus = async (student) => {
    try {
      const { data } = await api.patch(`/students/${student.id}/toggle-status`);
      setStudents((prev) => prev.map((s) => s.id === student.id ? data.data : s));
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete student "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/students/${id}`);
      setStudents((prev) => prev.filter((s) => s.id !== id));
      setTotal((t) => t - 1);
      toast.success('Student deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Directory</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track student learning journeys.{' '}
            <span className="font-semibold text-primary">{total} total students.</span>
          </p>
        </div>
      </div>

      {/* Search + Filter bar */}
      <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text" placeholder="Search by name or email..."
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-background border border-border rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-background border border-border rounded-xl text-sm px-4 py-2 outline-none focus:ring-2 focus:ring-primary/20">
          <option value="">All Students</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: total, icon: <UserCheck size={18} />, color: 'text-blue-500' },
          { label: 'Shown', value: students.length, icon: <Eye size={18} />, color: 'text-primary' },
          { label: 'Active', value: students.filter((s) => s.is_active).length, icon: <UserCheck size={18} />, color: 'text-green-500' },
          { label: 'Inactive', value: students.filter((s) => !s.is_active).length, icon: <UserX size={18} />, color: 'text-red-500' },
        ].map((stat) => (
          <div key={stat.label} className="glass-card rounded-xl p-4 flex items-center gap-3">
            <span className={stat.color}>{stat.icon}</span>
            <div>
              <div className="text-xl font-black">{stat.value}</div>
              <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Student List */}
      {loading ? (
        <div className="flex items-center justify-center h-64"><Loader2 size={40} className="animate-spin text-primary" /></div>
      ) : students.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          <UserX size={48} className="mx-auto mb-4 opacity-30" />
          <p className="font-semibold">No students found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {students.map((student, i) => (
            <motion.div key={student.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              className={cn('glass-card p-4 rounded-2xl group transition-all duration-300', student.is_active ? 'hover:border-primary/30' : 'opacity-70 border-red-500/10')}>
              <div className="flex flex-col md:flex-row items-center gap-4">
                {/* Avatar */}
                <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 font-bold text-lg',
                  student.is_active ? 'bg-gradient-to-tr from-primary/20 to-secondary/20 border-white/10 text-primary' : 'bg-muted border-border text-muted-foreground')}>
                  {student.name?.charAt(0)?.toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center gap-2 justify-center md:justify-start">
                    <h3 className="font-bold group-hover:text-primary transition-colors">{student.name}</h3>
                    <span className={cn('px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border',
                      student.is_active ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20')}>
                      {student.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1 mt-1">
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Mail size={11} /> {student.email}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar size={11} /> {new Date(student.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                    </span>
                    {student.phone && <span className="text-xs text-muted-foreground">{student.phone}</span>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleStatus(student)}
                    title={student.is_active ? 'Deactivate' : 'Activate'}
                    className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all',
                      student.is_active ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white' : 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500 hover:text-white')}>
                    {student.is_active ? <><ToggleLeft size={14} /> Deactivate</> : <><ToggleRight size={14} /> Activate</>}
                  </button>
                  <button onClick={() => handleDelete(student.id, student.name)}
                    className="p-2 rounded-xl bg-background border border-border hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all">
                    <Trash2 size={15} />
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
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted disabled:opacity-40 transition-all">Previous</button>
          <span className="text-sm text-muted-foreground px-4">Page {page} of {Math.ceil(total / limit)}</span>
          <button onClick={() => setPage((p) => p + 1)} disabled={page >= Math.ceil(total / limit)}
            className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted disabled:opacity-40 transition-all">Next</button>
        </div>
      )}
    </div>
  );
};

export default Students;
