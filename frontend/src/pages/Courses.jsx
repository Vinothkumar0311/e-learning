import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Users, 
  Star, 
  Clock, 
  BookOpen, 
  LayoutGrid, 
  List, 
  Edit, 
  Trash2, 
  X, 
  Loader2, 
  Video, 
  FileText, 
  HelpCircle, 
  ArrowLeft 
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../lib/api';
import { cn } from '../lib/utils';

const STATUS_STYLES = {
  published: 'bg-green-500/10 text-green-500 border-green-500/20',
  draft: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  archived: 'bg-muted text-muted-foreground border-border',
};

const LEVELS = ['beginner', 'intermediate', 'advanced'];
const STATUSES = ['draft', 'published', 'archived'];

const defaultForm = { 
  title: '', 
  description: '', 
  price: '', 
  category: '', 
  level: 'beginner', 
  instructor_name: '', 
  status: 'draft' 
};

const MODULE_TYPE_STYLES = {
  video: {
    bg: 'bg-blue-500/10 text-blue-500 border-blue-500/20 dark:bg-blue-500/20',
    icon: Video,
    colorClass: 'text-blue-500'
  },
  pdf: {
    bg: 'bg-rose-500/10 text-rose-500 border-rose-500/20 dark:bg-rose-500/20',
    icon: FileText,
    colorClass: 'text-rose-500'
  },
  quiz: {
    bg: 'bg-purple-500/10 text-purple-500 border-purple-500/20 dark:bg-purple-500/20',
    icon: HelpCircle,
    colorClass: 'text-purple-500'
  }
};

// --- Course Edit/Create Modal ---
const CourseModal = ({ course, onClose, onSave }) => {
  const [form, setForm] = useState(course || defaultForm);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (course?.id) {
        const { data } = await api.put(`/courses/${course.id}`, form);
        onSave(data.data, false);
        toast.success('Course updated');
      } else {
        const { data } = await api.post('/courses', form);
        onSave(data.data, true);
        toast.success('Course created');
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save course');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-2xl w-full max-w-lg p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">{course?.id ? 'Edit Course' : 'New Course'}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Course Title *</label>
              <input
                className="mt-1 w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="e.g. React Masterclass"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</label>
              <textarea
                className="mt-1 w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Brief course description..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Price (₹) *</label>
                <input type="number" className="mt-1 w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required placeholder="4999" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</label>
                <input className="mt-1 w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Development" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Level</label>
                <select className="mt-1 w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
                  {LEVELS.map((l) => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
                <select className="mt-1 w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Instructor Name *</label>
              <input className="mt-1 w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={form.instructor_name} onChange={(e) => setForm({ ...form, instructor_name: e.target.value })} required placeholder="Instructor full name" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border hover:bg-muted transition-all text-sm font-medium">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {saving && <Loader2 size={16} className="animate-spin" />}
              {course?.id ? 'Save Changes' : 'Create Course'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// --- Module Create/Edit Modal ---
const ModuleModal = ({ module, courseId, onClose, onSave }) => {
  const [form, setForm] = useState({
    title: module?.title || '',
    type: module?.type || 'video',
    duration: module?.duration || '',
    order: module?.order || '0'
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        duration: form.duration ? parseInt(form.duration) : null,
        order: parseInt(form.order) || 0
      };

      if (module?.id) {
        const { data } = await api.put(`/courses/${courseId}/modules/${module.id}`, payload);
        onSave(data.data, false);
        toast.success('Module updated successfully');
      } else {
        const { data } = await api.post(`/courses/${courseId}/modules`, payload);
        onSave(data.data, true);
        toast.success('Module added successfully');
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save module');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-2xl w-full max-w-md p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">{module?.id ? 'Edit Module' : 'Add New Module'}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Module Title *</label>
            <input
              className="mt-1 w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="e.g. Introduction to React Hooks"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</label>
              <select className="mt-1 w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="video">🎥 Video</option>
                <option value="pdf">📄 PDF Document</option>
                <option value="quiz">📝 Quiz</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Duration (mins)</label>
              <input type="number" className="mt-1 w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="15" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Display Sequence Order</label>
            <input type="number" className="mt-1 w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} placeholder="e.g. 1" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border hover:bg-muted transition-all text-sm font-medium">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {saving && <Loader2 size={16} className="animate-spin" />}
              {module?.id ? 'Save Changes' : 'Add Module'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// --- Main Courses Component ---
const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 12;

  // Selected Course details view
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedCourseDetails, setSelectedCourseDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  // Module managing states
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [editingModule, setEditingModule] = useState(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit, ...(search && { search }), ...(statusFilter && { status: statusFilter }) };
      const { data } = await api.get('/courses', { params });
      setCourses(data.data.courses);
      setTotal(data.data.total);
    } catch (err) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { 
    fetchCourses(); 
  }, [fetchCourses]);

  const fetchCourseDetails = useCallback(async (courseId) => {
    setLoadingDetails(true);
    try {
      const { data } = await api.get(`/courses/${courseId}`);
      setSelectedCourseDetails(data.data);
    } catch (err) {
      toast.error('Failed to load course curriculum details');
    } finally {
      setLoadingDetails(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchCourseDetails(selectedCourse.id);
    } else {
      setSelectedCourseDetails(null);
    }
  }, [selectedCourse, fetchCourseDetails]);

  const handleSave = (saved, isNew) => {
    if (isNew) {
      setCourses((prev) => [saved, ...prev]);
      setTotal((prev) => prev + 1);
    } else {
      setCourses((prev) => prev.map((c) => (c.id === saved.id ? saved : c)));
      if (selectedCourse?.id === saved.id) {
        setSelectedCourse(saved);
      }
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this course? This cannot be undone.')) return;
    try {
      await api.delete(`/courses/${id}`);
      setCourses((prev) => prev.filter((c) => c.id !== id));
      setTotal((prev) => prev - 1);
      toast.success('Course deleted');
      if (selectedCourse?.id === id) {
        setSelectedCourse(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  // Module actions
  const handleModuleSave = (saved, isNew) => {
    if (isNew) {
      setSelectedCourseDetails((prev) => ({
        ...prev,
        modules: [...(prev?.modules || []), saved].sort((a, b) => a.order - b.order)
      }));
    } else {
      setSelectedCourseDetails((prev) => ({
        ...prev,
        modules: (prev?.modules || []).map((m) => (m.id === saved.id ? saved : m)).sort((a, b) => a.order - b.order)
      }));
    }
  };

  const handleModuleDelete = async (moduleId) => {
    if (!confirm('Delete this curriculum module? This cannot be undone.')) return;
    try {
      await api.delete(`/courses/${selectedCourse.id}/modules/${moduleId}`);
      setSelectedCourseDetails((prev) => ({
        ...prev,
        modules: (prev?.modules || []).filter((m) => m.id !== moduleId)
      }));
      toast.success('Module deleted successfully');
    } catch (err) {
      toast.error('Failed to delete module');
    }
  };

  // Render Detailed Course View (Curriculum & Info)
  if (selectedCourse) {
    const courseDetails = selectedCourseDetails || selectedCourse;
    const modules = courseDetails.modules || [];

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        {showModuleModal && (
          <ModuleModal
            module={editingModule}
            courseId={selectedCourse.id}
            onClose={() => { setShowModuleModal(false); setEditingModule(null); }}
            onSave={handleModuleSave}
          />
        )}

        {/* Back and Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedCourse(null)}
              className="p-3 rounded-xl border border-border bg-background/50 hover:bg-muted transition-all duration-200 text-muted-foreground hover:text-foreground flex items-center justify-center shadow-sm"
              title="Back to Catalog"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-black tracking-tight">{courseDetails.title}</h1>
                <span className={cn('px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border', STATUS_STYLES[courseDetails.status] || STATUS_STYLES.draft)}>
                  {courseDetails.status}
                </span>
              </div>
              <p className="text-muted-foreground mt-1">
                Curriculum Manager • Instructor: <span className="font-semibold text-primary">{courseDetails.instructor_name}</span>
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => { setEditingCourse(courseDetails); setShowModal(true); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-background hover:bg-muted font-semibold text-sm transition-all"
            >
              <Edit size={16} /> Edit Course Details
            </button>
          </div>
        </div>

        {/* Two Column details workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left panel - Info Sidebar */}
          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-6 space-y-6 border border-white/20">
              <div className="h-44 bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/20 flex items-center justify-center rounded-xl relative overflow-hidden shadow-inner">
                <BookOpen size={64} className="text-primary/30" />
                <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/5 pointer-events-none" />
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Description</h3>
                  <p className="text-sm mt-1.5 leading-relaxed text-foreground/80 break-words whitespace-pre-wrap">
                    {courseDetails.description || 'No description available for this course.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-muted/30 border border-border/40">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Price</span>
                    <span className="text-xl font-extrabold text-primary mt-1 block">₹{parseFloat(courseDetails.price).toLocaleString()}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/30 border border-border/40">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Difficulty</span>
                    <span className="text-sm font-extrabold capitalize text-foreground mt-1 block">{courseDetails.level}</span>
                  </div>
                </div>

                {courseDetails.category && (
                  <div>
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Category</h3>
                    <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                      {courseDetails.category}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Curriculum Aggregates card */}
            <div className="glass-card rounded-2xl p-6 border border-white/20">
              <h3 className="font-extrabold text-lg mb-4">Curriculum Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-sm text-muted-foreground">Total Lessons/Modules</span>
                  <span className="font-bold text-foreground text-sm">{modules.length}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">Total Duration</span>
                  <span className="font-bold text-foreground text-sm">
                    {modules.reduce((sum, m) => sum + (m.duration || 0), 0)} mins
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel - Curriculum and Modules List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between pb-4 border-b border-border/50">
                <div>
                  <h3 className="font-bold text-xl">Course Syllabus Curriculum</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Chronologically ordered course content and exercises.</p>
                </div>
                <button
                  onClick={() => {
                    setEditingModule({ title: '', type: 'video', duration: '', order: String(modules.length + 1) });
                    setShowModuleModal(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all font-semibold text-sm shadow-md shadow-primary/15"
                >
                  <Plus size={16} /> Add Module
                </button>
              </div>

              {loadingDetails ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 size={36} className="animate-spin text-primary" />
                </div>
              ) : modules.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                  <LayoutGrid size={48} className="mx-auto mb-4 opacity-20 text-primary" />
                  <p className="font-bold text-lg">No syllabus modules defined</p>
                  <p className="text-sm mt-1 max-w-xs mx-auto">This course doesn't have any lessons, documents, or quizzes. Click "Add Module" to start compiling your content!</p>
                </div>
              ) : (
                <div className="mt-6 space-y-3.5">
                  {modules.map((mod, i) => {
                    const style = MODULE_TYPE_STYLES[mod.type] || MODULE_TYPE_STYLES.video;
                    const Icon = style.icon;

                    return (
                      <motion.div
                        key={mod.id || i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border bg-background/50 hover:bg-background/80 hover:border-primary/20 transition-all duration-200 group gap-4 shadow-sm"
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border font-bold text-sm shrink-0", style.bg)}>
                            <Icon size={18} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-black text-primary/70">#{mod.order}</span>
                              <h4 className="font-bold text-base text-foreground break-all">{mod.title}</h4>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                              <span className="capitalize">{mod.type}</span>
                              {mod.duration && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-1"><Clock size={12} /> {mod.duration} mins</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0 self-end sm:self-center">
                          <button
                            onClick={() => { setEditingModule(mod); setShowModuleModal(true); }}
                            className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-primary hover:text-white transition-colors"
                            title="Edit Module"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleModuleDelete(mod.id)}
                            className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-red-500 hover:text-white transition-colors"
                            title="Delete Module"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Grid/Catalog View
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {showModal && (
        <CourseModal
          course={editingCourse}
          onClose={() => { setShowModal(false); setEditingCourse(null); }}
          onSave={handleSave}
        />
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Courses Management</h1>
          <p className="text-muted-foreground mt-1">
            Create, edit, and manage your learning content. <span className="font-semibold text-primary">{total} total courses.</span>
          </p>
        </div>
        <button 
          onClick={() => { setEditingCourse(null); setShowModal(true); }} 
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all font-semibold shadow-lg shadow-primary/20"
        >
          <Plus size={20} /> Add New Course
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass-card p-4 rounded-2xl border border-white/20">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search courses..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-background border border-border rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <select 
            value={statusFilter} 
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-background border border-border rounded-xl text-sm px-4 py-2 outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 size={40} className="animate-spin text-primary" />
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
          <p className="font-semibold">No courses found</p>
          <p className="text-sm mt-1">Try adjusting your filters or create a new course.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((course, i) => (
            <motion.div 
              key={course.id} 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ delay: i * 0.04 }}
              onClick={() => setSelectedCourse(course)}
              className="glass-card rounded-2xl overflow-hidden group hover:scale-[1.02] transition-all duration-300 cursor-pointer border border-white/20 flex flex-col justify-between"
            >
              <div>
                <div className="relative h-36 bg-gradient-to-br from-primary/10 to-secondary/15 flex items-center justify-center overflow-hidden">
                  <BookOpen size={40} className="text-primary/30 group-hover:scale-110 transition-transform duration-300" />
                  
                  <div className="absolute top-3 right-3 flex gap-1.5">
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setEditingCourse(course); 
                        setShowModal(true); 
                      }}
                      className="p-1.5 rounded-lg bg-black/40 backdrop-blur-md text-white hover:bg-primary transition-colors"
                      title="Edit Course"
                    >
                      <Edit size={13} />
                    </button>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        handleDelete(course.id); 
                      }}
                      className="p-1.5 rounded-lg bg-black/40 backdrop-blur-md text-white hover:bg-red-500 transition-colors"
                      title="Delete Course"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <span className={cn('px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border', STATUS_STYLES[course.status] || STATUS_STYLES.draft)}>
                      {course.status}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <div>
                    <h3 className="font-extrabold text-base line-clamp-1 group-hover:text-primary transition-colors">{course.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">by {course.instructor_name}</p>
                  </div>
                  {course.category && (
                    <span className="inline-block px-2.5 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                      {course.category}
                    </span>
                  )}
                </div>
              </div>

              <div className="px-5 pb-5 pt-3 border-t border-white/5 flex items-center justify-between mt-auto">
                <span className="text-xl font-black text-primary">₹{parseFloat(course.price).toLocaleString()}</span>
                <span className="text-xs text-muted-foreground capitalize font-semibold">{course.level}</span>
              </div>
            </motion.div>
          ))}

          {/* Add Course Card Button */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ delay: 0.2 }}
            onClick={() => { setEditingCourse(null); setShowModal(true); }}
            className="rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center p-8 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group min-h-[220px] shadow-sm"
          >
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
              <Plus size={24} />
            </div>
            <p className="font-bold text-muted-foreground group-hover:text-primary transition-colors text-center">Create a New Course</p>
          </motion.div>
        </div>
      )}

      {/* Pagination */}
      {total > limit && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))} 
            disabled={page === 1}
            className="px-4 py-2 rounded-xl border border-border text-sm font-semibold hover:bg-muted disabled:opacity-40 transition-all bg-background/50"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground px-4">
            Page {page} of {Math.ceil(total / limit)}
          </span>
          <button 
            onClick={() => setPage(p => p + 1)} 
            disabled={page >= Math.ceil(total / limit)}
            className="px-4 py-2 rounded-xl border border-border text-sm font-semibold hover:bg-muted disabled:opacity-40 transition-all bg-background/50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Courses;
