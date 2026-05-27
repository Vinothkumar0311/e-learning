const { Course, CourseModule, CourseSection } = require('../models');
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
    const course = await Course.findByPk(req.params.id, {
      include: [
        { model: CourseModule, as: 'modules' },
        {
          model: CourseSection,
          as: 'sections',
          where: { parent_id: null },
          required: false,
          include: [
            { model: CourseModule, as: 'modules' },
            {
              model: CourseSection,
              as: 'subsections',
              include: [{ model: CourseModule, as: 'modules' }]
            }
          ]
        }
      ]
    });
    if (!course) return error(res, 'Course not found', 404);

    const courseJson = course.toJSON();
    if (courseJson.sections) {
      courseJson.sections.sort((a, b) => (a.order || 0) - (b.order || 0));
      courseJson.sections.forEach(sec => {
        if (sec.modules) {
          sec.modules.sort((a, b) => (a.order || 0) - (b.order || 0));
        }
        if (sec.subsections) {
          sec.subsections.sort((a, b) => (a.order || 0) - (b.order || 0));
          sec.subsections.forEach(sub => {
            if (sub.modules) {
              sub.modules.sort((a, b) => (a.order || 0) - (b.order || 0));
            }
          });
        }
      });
    }

    success(res, courseJson);
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
// @access  Private (Super Admin / Admin)
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return error(res, 'Course not found', 404);

    const { CourseSection, Material, LiveClass, CartItem, Enrollment, Payment } = require('../models');

    // 1. Delete associated materials
    if (Material) {
      await Material.destroy({ where: { course_id: course.id } });
    }

    // 2. Delete associated live classes and their attendance records
    if (LiveClass) {
      const { Attendance } = require('../models');
      const liveClasses = await LiveClass.findAll({ where: { course_id: course.id } });
      const liveClassIds = liveClasses.map(lc => lc.id);
      if (liveClassIds.length > 0) {
        if (Attendance) {
          await Attendance.destroy({ where: { live_class_id: liveClassIds } });
        }
        await LiveClass.destroy({ where: { id: liveClassIds } });
      }
    }

    // 3. Delete associated cart items
    if (CartItem) {
      await CartItem.destroy({ where: { course_id: course.id } });
    }

    // 4. Delete modules
    await CourseModule.destroy({ where: { course_id: course.id } });

    // 5. Delete sections
    if (CourseSection) {
      await CourseSection.destroy({ where: { course_id: course.id } });
    }

    // 6. Delete associated enrollments, payments, and payment audit logs
    if (Enrollment) {
      const enrollments = await Enrollment.findAll({ where: { course_id: course.id } });
      const enrollmentIds = enrollments.map(e => e.id);
      if (enrollmentIds.length > 0) {
        if (Payment) {
          const payments = await Payment.findAll({ where: { enrollment_id: enrollmentIds } });
          const paymentIds = payments.map(p => p.id);
          if (paymentIds.length > 0) {
            const { PaymentAuditLog } = require('../models');
            if (PaymentAuditLog) {
              await PaymentAuditLog.destroy({ where: { payment_id: paymentIds } });
            }
            await Payment.destroy({ where: { id: paymentIds } });
          }
        }
        await Enrollment.destroy({ where: { id: enrollmentIds } });
      }
    }

    // 7. Delete the course itself
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

    const { title, order, type, duration, youtube_url, file_url, section_id } = req.body;
    const courseModule = await CourseModule.create({
      title,
      order: order || 0,
      type: type || 'video',
      duration,
      youtube_url,
      file_url,
      section_id: section_id || null,
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

// @desc    Get all sections for a course
// @route   GET /api/courses/:courseId/sections
// @access  Private (Admin)
exports.getSections = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.courseId);
    if (!course) return error(res, 'Course not found', 404);

    const sections = await CourseSection.findAll({
      where: { course_id: req.params.courseId },
      include: [{ model: CourseModule, as: 'modules' }],
      order: [
        ['order', 'ASC'],
        [{ model: CourseModule, as: 'modules' }, 'order', 'ASC']
      ]
    });
    success(res, sections);
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Create a course section
// @route   POST /api/courses/:courseId/sections
// @access  Private (Admin)
exports.createSection = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.courseId);
    if (!course) return error(res, 'Course not found', 404);

    const { title, description, order, parent_id } = req.body;
    const section = await CourseSection.create({
      title,
      description,
      order: order || 0,
      course_id: req.params.courseId,
      parent_id: parent_id || null
    });
    success(res, section, 'Section created successfully', 201);
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Update a course section
// @route   PUT /api/courses/:courseId/sections/:id
// @access  Private (Admin)
exports.updateSection = async (req, res) => {
  try {
    const { courseId, id } = req.params;
    const section = await CourseSection.findOne({
      where: { id, course_id: courseId }
    });
    if (!section) return error(res, 'Section not found', 404);

    await section.update(req.body);
    success(res, section, 'Section updated successfully');
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Delete a course section
// @route   DELETE /api/courses/:courseId/sections/:id
// @access  Private (Admin)
exports.deleteSection = async (req, res) => {
  try {
    const { courseId, id } = req.params;
    const section = await CourseSection.findOne({
      where: { id, course_id: courseId }
    });
    if (!section) return error(res, 'Section not found', 404);

    // Unlink modules
    await CourseModule.update({ section_id: null }, { where: { section_id: section.id } });

    await section.destroy();
    success(res, null, 'Section deleted successfully');
  } catch (err) {
    error(res, err.message);
  }
};


