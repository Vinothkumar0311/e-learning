const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/studentAuthController');
const { 
  getCourses,
  getCourse,
  getMyCourses,
  getCourseMaterials,
  requestEnrollment,
  getMyEnrollments
} = require('../controllers/studentCourseController');
const { 
  addToCart,
  getCart,
  removeFromCart,
  checkout
} = require('../controllers/cartController');
const {
  markComplete,
  getCourseProgress,
  getPerformanceSummary
} = require('../controllers/progressController');
const { studentProtect, optionalStudentProtect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', studentProtect, getMe);

// Courses & Enrollments
// optionalStudentProtect: decodes JWT if present, but does NOT block unauthenticated requests
router.get('/courses', optionalStudentProtect, getCourses);
// Course detail requires auth so the assignment access guard can identify the student
router.get('/courses/:id', studentProtect, getCourse);
router.get('/courses/:id/materials', studentProtect, getCourseMaterials);
router.post('/enroll', studentProtect, requestEnrollment);
router.get('/my-enrollments', studentProtect, getMyEnrollments);

// My Courses (purchased / fully enrolled)
router.get('/my-courses', studentProtect, getMyCourses);

// Shopping Cart Flow
router.post('/cart/add', studentProtect, addToCart);
router.get('/cart', studentProtect, getCart);
router.delete('/cart/:id', studentProtect, removeFromCart);
router.post('/cart/checkout', studentProtect, checkout);

// Student Progress & Performance
router.post('/progress/mark', studentProtect, markComplete);
router.get('/progress/:courseId', studentProtect, getCourseProgress);
router.get('/performance', studentProtect, getPerformanceSummary);

module.exports = router;
