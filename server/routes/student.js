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
const { studentProtect, optionalStudentProtect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', studentProtect, getMe);

// Courses & Enrollments
// optionalStudentProtect: decodes JWT if present, but does NOT block unauthenticated requests
// This lets getCourses exclude enrolled courses for logged-in students
router.get('/courses', optionalStudentProtect, getCourses);
router.get('/courses/:id', getCourse);
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

module.exports = router;
