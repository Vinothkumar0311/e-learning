const { Student, Enrollment, Course } = require('../models');
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
    const { name, email, phone } = req.body;
    await student.update({ name, email, phone });
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
