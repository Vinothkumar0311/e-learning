import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, Award, BookOpen, Clock, ChevronDown, ChevronUp, CheckCircle, PlayCircle, BarChart2 } from 'lucide-react';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '../lib/api';
import { cn } from '../lib/utils';

const Performance = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedStudentId, setExpandedStudentId] = useState(null);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const res = await api.get('/performance');
        setData(res.data.data);
      } catch (err) {
        toast.error('Failed to load performance analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchPerformance();
  }, []);

  const toggleRow = (studentId) => {
    setExpandedStudentId((prev) => (prev === studentId ? null : studentId));
  };

  // Filter leaderboard data
  const filteredData = useMemo(() => {
    return data.filter((row) =>
      row.student.name.toLowerCase().includes(search.toLowerCase()) ||
      row.student.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  // Aggregate KPI stats
  const stats = useMemo(() => {
    if (data.length === 0) return { avgCompletion: 0, totalCompleted: 0, topPerformer: 'N/A', avgHours: 0 };
    
    let totalPct = 0;
    let totalCompleted = 0;
    let totalHours = 0;
    let topName = 'N/A';
    let maxCompleted = -1;

    data.forEach((row) => {
      totalPct += row.summary.overallCompletionPercent || 0;
      totalCompleted += row.summary.completedModules || 0;
      totalHours += (row.summary.watchedDurationMins || 0) / 60;

      if (row.summary.completedModules > maxCompleted) {
        maxCompleted = row.summary.completedModules;
        topName = row.student.name;
      }
    });

    return {
      avgCompletion: Math.round(totalPct / data.length),
      totalCompleted,
      topPerformer: maxCompleted > 0 ? topName : 'N/A',
      avgHours: (totalHours / data.length).toFixed(1),
    };
  }, [data]);

  // Chart data: Average completion percent per course
  const courseChartData = useMemo(() => {
    const courseMap = {};
    data.forEach((row) => {
      row.courses.forEach((c) => {
        if (!courseMap[c.courseTitle]) {
          courseMap[c.courseTitle] = { title: c.courseTitle, totalPercent: 0, count: 0 };
        }
        courseMap[c.courseTitle].totalPercent += c.completionPercent;
        courseMap[c.courseTitle].count += 1;
      });
    });

    return Object.values(courseMap).map((item) => ({
      name: item.title.length > 20 ? item.title.substring(0, 20) + '...' : item.title,
      'Avg Progress (%)': Math.round(item.totalPercent / item.count),
    }));
  }, [data]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Performance Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Monitor syllabus progress, lesson completion rates, and learning engagement across all active student cohorts.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm font-medium">Crunching learning analytics...</p>
        </div>
      ) : (
        <>
          {/* KPI Dashboard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Avg Course Progress', value: `${stats.avgCompletion}%`, icon: <Award className="w-5 h-5 text-indigo-500" />, desc: 'Global average syllabus progress' },
              { title: 'Modules Completed', value: stats.totalCompleted, icon: <CheckCircle className="w-5 h-5 text-green-500" />, desc: 'Total lessons completed' },
              { title: 'Leaderboard Top', value: stats.topPerformer, icon: <PlayCircle className="w-5 h-5 text-amber-500" />, desc: 'Student with highest lessons done' },
              { title: 'Avg Watch Time', value: `${stats.avgHours} hrs`, icon: <Clock className="w-5 h-5 text-blue-500" />, desc: 'Average stream time per student' },
            ].map((card, i) => (
              <div key={i} className="glass-card p-6 rounded-2xl flex flex-col justify-between hover:scale-[1.01] transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground font-medium">{card.title}</span>
                  <div className="p-2 bg-background border border-border rounded-xl">{card.icon}</div>
                </div>
                <div className="mt-4">
                  <h3 className="text-2xl font-bold">{card.value}</h3>
                  <p className="text-[11px] text-muted-foreground mt-1">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 glass-card p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2"><BarChart2 className="w-5 h-5 text-primary" /> Course Engagement Rates</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Average completion status breakdown by registered program</p>
              </div>
              <div className="h-[280px] w-full mt-6">
                {courseChartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No course statistics available.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={courseChartData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 11 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 11 }} domain={[0, 100]} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--background)', borderRadius: '12px', border: '1px solid var(--border)' }} />
                      <Bar dataKey="Avg Progress (%)" radius={[6, 6, 0, 0]} maxBarSize={45}>
                        {courseChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`hsl(var(--primary) / ${0.5 + (index % 5) * 0.1})`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl flex flex-col">
              <h3 className="font-bold text-lg">Top Performance Checklist</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Quick guide to boost student stats</p>
              <div className="mt-6 flex-1 flex flex-col justify-around gap-4 text-sm text-muted-foreground">
                <div className="flex gap-3 items-start">
                  <div className="p-1 bg-green-500/10 rounded-lg text-green-500 shrink-0">✔</div>
                  <p><strong>Auto Video Playback:</strong> Progress is logged immediately as the student finishes a lesson video module.</p>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="p-1 bg-green-500/10 rounded-lg text-green-500 shrink-0">✔</div>
                  <p><strong>Document Verification:</strong> Opening pdf/doc files triggers progress logs in materials list automatically.</p>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="p-1 bg-green-500/10 rounded-lg text-green-500 shrink-0">✔</div>
                  <p><strong>Dues Block:</strong> Restricting access on late payments suspends video players immediately, pausing analytics.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Student Leaderboard */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-bold text-lg">Student Syllabus Leaderboard</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Explore each student's progress and completed lessons checklist</p>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search student..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            {filteredData.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground text-sm">No student matching your query.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-xs uppercase text-muted-foreground border-b border-white/5 bg-muted/30">
                      <th className="px-6 py-4 font-semibold">Student</th>
                      <th className="px-6 py-4 font-semibold">Overall Syllabus</th>
                      <th className="px-6 py-4 font-semibold text-center">Lessons Finished</th>
                      <th className="px-6 py-4 font-semibold text-center">Assigned Courses</th>
                      <th className="px-6 py-4 font-semibold text-center">Watch Time</th>
                      <th className="px-6 py-4 font-semibold"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredData.map((row) => {
                      const isExpanded = expandedStudentId === row.student.id;
                      return (
                        <React.Fragment key={row.student.id}>
                          <tr className={cn("hover:bg-white/5 transition-colors cursor-pointer", isExpanded && "bg-white/5")} onClick={() => toggleRow(row.student.id)}>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                                  {row.student.name.charAt(0)}
                                </div>
                                <div>
                                  <span className="font-semibold text-sm block">{row.student.name}</span>
                                  <span className="text-[11px] text-muted-foreground block">{row.student.email}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3 min-w-[150px]">
                                <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                                  <div
                                    className="bg-primary h-full rounded-full transition-all duration-500"
                                    style={{ width: `${row.summary.overallCompletionPercent}%` }}
                                  />
                                </div>
                                <span className="font-bold text-sm text-primary shrink-0">{row.summary.overallCompletionPercent}%</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center text-sm font-semibold text-foreground">
                              {row.summary.completedModules} <span className="text-xs text-muted-foreground font-normal">/ {row.summary.totalModules}</span>
                            </td>
                            <td className="px-6 py-4 text-center text-sm text-muted-foreground">
                              {row.summary.totalCourses}
                            </td>
                            <td className="px-6 py-4 text-center text-sm text-muted-foreground">
                              {((row.summary.watchedDurationMins || 0) / 60).toFixed(1)} hrs
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button className="p-1.5 hover:bg-background rounded-lg border border-transparent hover:border-border text-muted-foreground">
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </button>
                            </td>
                          </tr>

                          {/* Expandable detail row */}
                          <tr className={cn("bg-muted/10", !isExpanded && "hidden")}>
                            <td colSpan="6" className="px-8 py-6">
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-4"
                                  >
                                    <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Course-by-Course Details</h4>
                                    {row.courses.length === 0 ? (
                                      <p className="text-xs text-muted-foreground">No course assigned yet.</p>
                                    ) : (
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {row.courses.map((course) => (
                                          <div key={course.courseId} className="bg-background border border-border p-4 rounded-xl flex flex-col justify-between gap-3 shadow-sm">
                                            <div>
                                              <span className="font-bold text-sm block">{course.courseTitle}</span>
                                              <span className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                                <BookOpen className="w-3.5 h-3.5" /> {course.completedModules} / {course.totalModules} lessons completed
                                              </span>
                                            </div>
                                            <div>
                                              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                                                <span className="text-muted-foreground">Progress</span>
                                                <span className="text-primary">{course.completionPercent}%</span>
                                              </div>
                                              <div className="bg-muted rounded-full h-1.5 w-full overflow-hidden">
                                                <div
                                                  className="bg-primary h-full rounded-full"
                                                  style={{ width: `${course.completionPercent}%` }}
                                                />
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </td>
                          </tr>
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Performance;
