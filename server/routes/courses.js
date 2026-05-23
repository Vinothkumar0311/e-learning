const express = require('express');
const router = express.Router();
const { 
  getCourses, 
  createCourse, 
  getCourse, 
  updateCourse, 
  deleteCourse,
  getModules,
  createModule,
  updateModule,
  deleteModule
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getCourses)
  .post(authorize('admin', 'super_admin'), createCourse);

router.route('/:id')
  .get(getCourse)
  .put(authorize('admin', 'super_admin'), updateCourse)
  .delete(authorize('super_admin'), deleteCourse);

// Course Modules sub-routes
router.route('/:courseId/modules')
  .get(getModules)
  .post(authorize('admin', 'super_admin'), createModule);

router.route('/:courseId/modules/:id')
  .put(authorize('admin', 'super_admin'), updateModule)
  .delete(authorize('admin', 'super_admin'), deleteModule);

module.exports = router;
