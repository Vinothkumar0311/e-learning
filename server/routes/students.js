const express = require('express');
const router = express.Router();
const { 
  getStudents, 
  getStudent, 
  toggleStudentStatus, 
  updateStudent, 
  deleteStudent,
  createStudentAdmission,
  assignCourses,
  getAssignedCourses,
  removeAssignedCourse
} = require('../controllers/studentController');
const { getStudentPerformance } = require('../controllers/progressController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// List / Manage students
router.route('/').get(getStudents);
router.route('/:id')
  .get(getStudent)
  .put(authorize('admin', 'super_admin'), updateStudent)
  .delete(authorize('super_admin'), deleteStudent);
router.patch('/:id/toggle-status', authorize('admin', 'super_admin'), toggleStudentStatus);
router.get('/:id/performance', authorize('admin', 'super_admin'), getStudentPerformance);

// ─── Admission Management ───────────────────────────────────────────────────
// POST /api/students/create  — Admin creates student with auto-credentials
router.post('/create', authorize('admin', 'super_admin'), createStudentAdmission);

// ─── Course Assignment ──────────────────────────────────────────────────────
// POST /api/students/:id/assign-courses  — Assign course(s) to a student
router.post('/:id/assign-courses', authorize('admin', 'super_admin'), assignCourses);
// GET  /api/students/:id/assigned-courses — View all course assignments for student
router.get('/:id/assigned-courses', authorize('admin', 'super_admin'), getAssignedCourses);
// DELETE /api/students/:id/assigned-courses/:courseId — Remove one assignment
router.delete('/:id/assigned-courses/:courseId', authorize('admin', 'super_admin'), removeAssignedCourse);

module.exports = router;
