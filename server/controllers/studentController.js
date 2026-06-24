const { Student, Enrollment, Course, StudentAssignedCourse, User } = require('../models');
const { success, error } = require('../utils/response');
const { Op } = require('sequelize');

// @desc    Get all students (with optional search)
// @route   GET /api/students
// @access  Private (Admin)
exports.getStudents = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 15 } = req.query;
    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { mobile_number: { [Op.like]: `%${search}%` } },
      ];
    }
    if (status === 'active') where.is_active = true;
    if (status === 'inactive') where.is_active = false;

    const offset = (page - 1) * limit;
    const { count, rows } = await Student.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
    });

    success(res, { students: rows, total: count, page: parseInt(page), pages: Math.ceil(count / limit) });
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Get single student with enrollments
// @route   GET /api/students/:id
// @access  Private (Admin)
exports.getStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Enrollment, include: [Course] }],
    });
    if (!student) return error(res, 'Student not found', 404);
    success(res, student);
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Toggle student active status
// @route   PATCH /api/students/:id/toggle-status
// @access  Private (Admin)
exports.toggleStudentStatus = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id, { attributes: { exclude: ['password'] } });
    if (!student) return error(res, 'Student not found', 404);
    student.is_active = !student.is_active;
    await student.save();
    success(res, student, `Student ${student.is_active ? 'activated' : 'deactivated'} successfully`);
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private (Admin)
exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return error(res, 'Student not found', 404);
    const { name, email, phone, mobile_number } = req.body;
    await student.update({ name, email, phone, mobile_number });
    success(res, student, 'Student updated');
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private (Super Admin)
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return error(res, 'Student not found', 404);
    await student.destroy();
    success(res, null, 'Student deleted');
  } catch (err) {
    error(res, err.message);
  }
};

// ─── NEW: Admin Admission Functions ────────────────────────────────────────────

// @desc    Admin creates a new student admission (auto-generates credentials)
// @route   POST /api/students/create
// @access  Private (Admin)
exports.createStudentAdmission = async (req, res) => {
  try {
    const { name, email, mobile_number } = req.body;

    if (!name || !mobile_number) {
      return error(res, 'Student name and mobile number are required', 400);
    }

    // Check for duplicate mobile number
    const existingMobile = await Student.findOne({ where: { mobile_number } });
    if (existingMobile) {
      return error(res, 'A student with this mobile number already exists', 400);
    }

    // Check for duplicate email if provided
    if (email) {
      const existingEmail = await Student.findOne({ where: { email } });
      if (existingEmail) {
        return error(res, 'A student with this email already exists', 400);
      }
    }

    // Auto-generate credentials: username = name, password = mobile_number (bcrypt happens in model hook)
    const student = await Student.create({
      name,
      email: email || null,
      mobile_number,
      phone: mobile_number,
      // Password is set to mobile_number; the beforeCreate hook in Student.js will bcrypt it
      password: mobile_number,
    });

    const safeStudent = {
      id: student.id,
      name: student.name,
      email: student.email,
      mobile_number: student.mobile_number,
      is_active: student.is_active,
      createdAt: student.createdAt,
      // Return plain credentials so admin can share them
      credentials: {
        username: name,
        password: mobile_number,
        note: 'Student logs in with their Name as username and Mobile Number as password'
      }
    };

    success(res, safeStudent, 'Student admission created successfully', 201);
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Admin assigns one or multiple courses to a student
// @route   POST /api/students/:id/assign-courses
// @access  Private (Admin)
exports.assignCourses = async (req, res) => {
  try {
    const { course_ids } = req.body;
    const student_id = req.params.id;

    if (!course_ids || !Array.isArray(course_ids) || course_ids.length === 0) {
      return error(res, 'Please provide an array of course_ids', 400);
    }

    const student = await Student.findByPk(student_id);
    if (!student) return error(res, 'Student not found', 404);

    // Validate that all courses exist
    const courses = await Course.findAll({ where: { id: { [Op.in]: course_ids } } });
    if (courses.length !== course_ids.length) {
      return error(res, 'One or more course IDs are invalid', 400);
    }

    // Upsert assignments (ignore duplicates)
    const assignments = course_ids.map(course_id => ({
      student_id,
      course_id,
      assigned_by: req.user.id,
      assigned_at: new Date()
    }));

    await StudentAssignedCourse.bulkCreate(assignments, {
      updateOnDuplicate: ['assigned_by', 'assigned_at']
    });

    // Return updated assignment list
    const updated = await StudentAssignedCourse.findAll({
      where: { student_id },
      include: [{ model: Course, attributes: ['id', 'title', 'thumbnail', 'level', 'instructor_name'] }]
    });

    success(res, updated, `${course_ids.length} course(s) assigned successfully`);
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Get all courses assigned to a specific student (Admin view)
// @route   GET /api/students/:id/assigned-courses
// @access  Private (Admin)
exports.getAssignedCourses = async (req, res) => {
  try {
    const student_id = req.params.id;

    const student = await Student.findByPk(student_id, { attributes: { exclude: ['password'] } });
    if (!student) return error(res, 'Student not found', 404);

    const assignments = await StudentAssignedCourse.findAll({
      where: { student_id },
      include: [
        { model: Course, attributes: ['id', 'title', 'thumbnail', 'level', 'price', 'status', 'instructor_name'] },
        { model: User, as: 'assignedBy', attributes: ['id', 'name', 'email'] }
      ],
      order: [['assigned_at', 'DESC']]
    });

    success(res, { student, assignments });
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Remove a specific course assignment from a student
// @route   DELETE /api/students/:id/assigned-courses/:courseId
// @access  Private (Admin)
exports.removeAssignedCourse = async (req, res) => {
  try {
    const { id: student_id, courseId: course_id } = req.params;

    const assignment = await StudentAssignedCourse.findOne({ where: { student_id, course_id } });
    if (!assignment) return error(res, 'Assignment not found', 404);

    await assignment.destroy();
    success(res, null, 'Course assignment removed successfully');
  } catch (err) {
    error(res, err.message);
  }
};
