const express = require('express');
const router = express.Router();
const { getStudents, getStudent, toggleStudentStatus, updateStudent, deleteStudent } = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getStudents);
router.route('/:id').get(getStudent).put(authorize('admin', 'super_admin'), updateStudent).delete(authorize('super_admin'), deleteStudent);
router.patch('/:id/toggle-status', authorize('admin', 'super_admin'), toggleStudentStatus);

module.exports = router;
