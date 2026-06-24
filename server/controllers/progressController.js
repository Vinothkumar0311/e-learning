const {
  Student,
  Course,
  CourseModule,
  StudentProgress,
  StudentAssignedCourse,
} = require("../models");
const { success, error } = require("../utils/response");

// Helper: Calculate progress statistics for a student
const calculateStudentStats = async (studentId) => {
  // Get all assigned courses
  const assignments = await StudentAssignedCourse.findAll({
    where: { student_id: studentId },
    include: [{
      model: Course,
      include: [{ model: CourseModule, as: 'modules' }]
    }]
  });

  const progressRecords = await StudentProgress.findAll({
    where: { student_id: studentId }
  });

  const completedModuleIds = progressRecords.map(p => p.module_id);
  const completedMap = new Set(completedModuleIds);

  const courseStats = [];
  let totalAssignedModules = 0;
  let totalCompletedModules = 0;
  let overallDurationMins = 0;
  let watchedDurationMins = 0;

  for (const a of assignments) {
    if (!a.Course) continue;
    const course = a.Course;
    const modules = course.modules || [];
    
    let courseCompletedCount = 0;
    let courseTotalDuration = 0;
    let courseWatchedDuration = 0;

    const courseModuleProgress = [];

    for (const m of modules) {
      const isCompleted = completedMap.has(m.id);
      if (isCompleted) {
        courseCompletedCount++;
        courseWatchedDuration += m.duration || 0;
      }
      courseTotalDuration += m.duration || 0;

      courseModuleProgress.push({
        id: m.id,
        title: m.title,
        type: m.type,
        duration: m.duration,
        isCompleted
      });
    }

    totalAssignedModules += modules.length;
    totalCompletedModules += courseCompletedCount;
    overallDurationMins += courseTotalDuration;
    watchedDurationMins += courseWatchedDuration;

    courseStats.push({
      courseId: course.id,
      courseTitle: course.title,
      totalModules: modules.length,
      completedModules: courseCompletedCount,
      completionPercent: modules.length > 0 ? Math.round((courseCompletedCount / modules.length) * 100) : 0,
      totalDurationMins: courseTotalDuration,
      watchedDurationMins: courseWatchedDuration,
      completedModuleIds: modules.filter(m => completedMap.has(m.id)).map(m => m.id),
      modules: courseModuleProgress
    });
  }

  return {
    summary: {
      totalCourses: assignments.length,
      totalModules: totalAssignedModules,
      completedModules: totalCompletedModules,
      overallCompletionPercent: totalAssignedModules > 0 ? Math.round((totalCompletedModules / totalAssignedModules) * 100) : 0,
      totalDurationMins: overallDurationMins,
      watchedDurationMins
    },
    courses: courseStats
  };
};

// @desc    Mark a course module as completed
// @route   POST /api/student/progress/mark
// @access  Private (Student)
exports.markComplete = async (req, res) => {
  try {
    const { module_id, course_id, watch_duration = 0 } = req.body;

    if (!module_id || !course_id) {
      return error(res, "Please provide module_id and course_id", 400);
    }

    // Verify course module exists
    const module = await CourseModule.findByPk(module_id);
    if (!module) {
      return error(res, "Course module not found", 404);
    }

    // Upsert progress
    const [progress, created] = await StudentProgress.findOrCreate({
      where: {
        student_id: req.user.id,
        module_id
      },
      defaults: {
        course_id,
        watch_duration
      }
    });

    if (!created) {
      progress.watch_duration = watch_duration;
      await progress.save();
    }

    success(res, progress, "Progress updated successfully");
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Get completed module IDs for a single course
// @route   GET /api/student/progress/:courseId
// @access  Private (Student)
exports.getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const progress = await StudentProgress.findAll({
      where: {
        student_id: req.user.id,
        course_id: courseId
      },
      attributes: ["module_id", "completed_at"]
    });

    success(res, progress.map(p => p.module_id));
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Get overall student performance metrics
// @route   GET /api/student/performance
// @access  Private (Student)
exports.getPerformanceSummary = async (req, res) => {
  try {
    const data = await calculateStudentStats(req.user.id);
    success(res, data);
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Get performance summary of a specific student
// @route   GET /api/students/:id/performance
// @access  Private (Admin)
exports.getStudentPerformance = async (req, res) => {
  try {
    const data = await calculateStudentStats(req.params.id);
    success(res, data);
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Get leaderboard/completion stats for all students
// @route   GET /api/performance
// @access  Private (Admin)
exports.getAllStudentsPerformance = async (req, res) => {
  try {
    const students = await Student.findAll({
      attributes: ["id", "name", "email", "phone"],
      where: { is_active: true }
    });

    const list = [];
    for (const student of students) {
      const stats = await calculateStudentStats(student.id);
      list.push({
        student: {
          id: student.id,
          name: student.name,
          email: student.email,
          phone: student.phone
        },
        summary: stats.summary,
        courses: stats.courses
      });
    }

    // Sort leaderboard by completed module count descending
    list.sort((a, b) => b.summary.completedModules - a.summary.completedModules);

    success(res, list);
  } catch (err) {
    error(res, err.message);
  }
};
