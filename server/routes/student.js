const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/studentAuthController');
const { 
  getCourses, 
  getCourse, 
  getCourseMaterials, 
  requestEnrollment, 
  getMyEnrollments 
} = require('../controllers/studentCourseController');
const { studentProtect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', studentProtect, getMe);

// Courses & Enrollments
router.get('/courses', getCourses);
router.get('/courses/:id', getCourse);
router.get('/courses/:id/materials', studentProtect, getCourseMaterials);
router.post('/enroll', studentProtect, requestEnrollment);
router.get('/my-enrollments', studentProtect, getMyEnrollments);

module.exports = router;
