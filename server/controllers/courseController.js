const { Course, CourseModule } = require('../models');
const { success, error } = require('../utils/response');
const { Op } = require('sequelize');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private (Admin)
exports.getCourses = async (req, res) => {
  try {
    const { search, category, status, page = 1, limit = 12 } = req.query;
    const where = {};
    if (search) where.title = { [Op.like]: `%${search}%` };
    if (category) where.category = category;
    if (status) where.status = status;

    const offset = (page - 1) * limit;
    const { count, rows } = await Course.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
    });

    success(res, { courses: rows, total: count, page: parseInt(page), pages: Math.ceil(count / limit) });
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Create a course
// @route   POST /api/courses
// @access  Private (Admin)
exports.createCourse = async (req, res) => {
  try {
    const { title, description, price, category, level, instructor_name, status } = req.body;
    const course = await Course.create({ title, description, price, category, level, instructor_name, status: status || 'draft' });
    success(res, course, 'Course created successfully', 201);
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Private (Admin)
exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, { include: [{ model: CourseModule, as: 'modules' }] });
    if (!course) return error(res, 'Course not found', 404);
    success(res, course);
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private (Admin)
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return error(res, 'Course not found', 404);
    await course.update(req.body);
    success(res, course, 'Course updated successfully');
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private (Super Admin)
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return error(res, 'Course not found', 404);
    await course.destroy();
    success(res, null, 'Course deleted successfully');
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Get all modules for a course
// @route   GET /api/courses/:courseId/modules
// @access  Private (Admin)
exports.getModules = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.courseId);
    if (!course) return error(res, 'Course not found', 404);

    const modules = await CourseModule.findAll({
      where: { course_id: req.params.courseId },
      order: [['order', 'ASC']]
    });
    success(res, modules);
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Create a course module
// @route   POST /api/courses/:courseId/modules
// @access  Private (Admin)
exports.createModule = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.courseId);
    if (!course) return error(res, 'Course not found', 404);

    const { title, order, type, duration } = req.body;
    const courseModule = await CourseModule.create({
      title,
      order: order || 0,
      type: type || 'video',
      duration,
      course_id: req.params.courseId
    });
    success(res, courseModule, 'Module created successfully', 201);
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Update a course module
// @route   PUT /api/courses/:courseId/modules/:id
// @access  Private (Admin)
exports.updateModule = async (req, res) => {
  try {
    const { courseId, id } = req.params;
    const courseModule = await CourseModule.findOne({
      where: { id, course_id: courseId }
    });
    if (!courseModule) return error(res, 'Module not found', 404);

    await courseModule.update(req.body);
    success(res, courseModule, 'Module updated successfully');
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Delete a course module
// @route   DELETE /api/courses/:courseId/modules/:id
// @access  Private (Admin)
exports.deleteModule = async (req, res) => {
  try {
    const { courseId, id } = req.params;
    const courseModule = await CourseModule.findOne({
      where: { id, course_id: courseId }
    });
    if (!courseModule) return error(res, 'Module not found', 404);

    await courseModule.destroy();
    success(res, null, 'Module deleted successfully');
  } catch (err) {
    error(res, err.message);
  }
};

