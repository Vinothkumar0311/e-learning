import React from 'react';
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
  List
} from 'lucide-react';
import { courses } from '../data/mockData';
import { cn } from '../lib/utils';

const Courses = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Courses Management</h1>
          <p className="text-muted-foreground mt-1">Create, edit and manage your learning content.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all font-semibold shadow-lg shadow-primary/20">
          <Plus size={20} />
          Add New Course
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass-card p-4 rounded-2xl">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search courses..."
            className="w-full bg-background border border-border rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-background border border-border p-1 rounded-xl">
            <button className="p-2 rounded-lg bg-primary text-white shadow-sm">
              <LayoutGrid size={18} />
            </button>
            <button className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
              <List size={18} />
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-background border border-border hover:bg-muted transition-all text-sm font-medium">
            <Filter size={18} />
            Filters
          </button>
          <select className="bg-background border border-border rounded-xl text-sm px-4 py-2 outline-none focus:ring-2 focus:ring-primary/20 transition-all">
            <option>All Categories</option>
            <option>Design</option>
            <option>Development</option>
            <option>Business</option>
          </select>
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {courses.map((course, i) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card rounded-2xl overflow-hidden group hover:scale-[1.02] transition-all duration-300"
          >
            <div className="relative h-48 overflow-hidden">
              <img 
                src={course.image} 
                alt={course.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute top-3 right-3">
                <button className="p-2 rounded-lg bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-colors">
                  <MoreVertical size={16} />
                </button>
              </div>
              <div className="absolute bottom-3 left-3">
                <span className="px-2 py-1 rounded-lg bg-primary text-white text-[10px] font-bold uppercase tracking-wider shadow-lg">
                  {course.status}
                </span>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <h3 className="font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors">{course.title}</h3>
                <div className="flex items-center gap-1 mt-1 text-orange-500">
                  <Star size={14} fill="currentColor" />
                  <span className="text-sm font-bold">{course.rating}</span>
                  <span className="text-xs text-muted-foreground ml-1">({course.students} students)</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between py-3 border-y border-white/5">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <BookOpen size={14} />
                  <span className="text-xs font-medium">12 Modules</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock size={14} />
                  <span className="text-xs font-medium">24h 45m</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xl font-black text-primary">{course.price}</span>
                <button className="px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all text-xs font-bold uppercase tracking-wider">
                  Edit Course
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Empty placeholder to add more */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center p-8 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
            <Plus size={24} />
          </div>
          <p className="font-bold text-muted-foreground group-hover:text-primary transition-colors text-center">
            Create a New Course
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Courses;
