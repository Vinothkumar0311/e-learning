const { Course, CourseModule, Material, Enrollment } = require('../models');
const { success, error } = require('../utils/response');

// @desc    Get all published courses
// @route   GET /api/student/courses
// @access  Public
exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.findAll({
      where: { status: 'published' }
    });
    success(res, courses);
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Get single course with modules
// @route   GET /api/student/courses/:id
// @access  Public
exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [{ model: CourseModule, as: 'modules' }]
    });

    if (!course) {
      return error(res, 'Course not found', 404);
    }

    success(res, course);
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Get course materials (Enrolled only)
// @route   GET /api/student/courses/:id/materials
// @access  Private (Student)
exports.getCourseMaterials = async (req, res) => {
  try {
    // Check enrollment
    const enrollment = await Enrollment.findOne({
      where: {
        student_id: req.user.id,
        course_id: req.params.id,
        status: 'enrolled'
      }
    });

    if (!enrollment) {
      return error(res, 'You are not enrolled in this course or enrollment is pending', 403);
    }

    const materials = await Material.findAll({
      where: { course_id: req.params.id }
    });

    success(res, materials);
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Submit enrollment request
// @route   POST /api/student/enroll
// @access  Private (Student)
exports.requestEnrollment = async (req, res) => {
  const { course_id } = req.body;

  try {
    const course = await Course.findByPk(course_id);
    if (!course) {
      return error(res, 'Course not found', 404);
    }

    const existing = await Enrollment.findOne({
      where: {
        student_id: req.user.id,
        course_id
      }
    });

    if (existing) {
      return error(res, 'Enrollment request already exists for this course', 400);
    }

    const enrollment = await Enrollment.create({
      student_id: req.user.id,
      course_id,
      status: 'pending'
    });

    success(res, enrollment, 'Enrollment request submitted successfully', 201);
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Get my enrollments
// @route   GET /api/student/my-enrollments
// @access  Private (Student)
exports.getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.findAll({
      where: { student_id: req.user.id },
      include: [{ model: Course }]
    });
    success(res, enrollments);
  } catch (err) {
    error(res, err.message);
  }
};
