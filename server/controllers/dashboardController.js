const { Course, Student, Enrollment, Payment, LiveClass } = require('../models');
const { success, error } = require('../utils/response');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private (Admin)
exports.getStats = async (req, res) => {
  try {
    const [totalCourses, totalStudents, activeStudents, pendingEnrollments, totalRevenue] = await Promise.all([
      Course.count(),
      Student.count(),
      Student.count({ where: { is_active: true } }),
      Enrollment.count({ where: { status: 'pending' } }),
      Payment.sum('amount', { where: { status: 'paid' } }),
    ]);

    success(res, {
      totalCourses,
      totalStudents,
      activeStudents,
      pendingEnrollments,
      totalRevenue: totalRevenue || 0,
    });
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Get recent enrollments
// @route   GET /api/dashboard/recent-enrollments
// @access  Private (Admin)
exports.getRecentEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [
        { model: Student, attributes: ['name', 'email'] },
        { model: Course, attributes: ['title'] },
      ],
    });
    success(res, enrollments);
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Get upcoming live classes
// @route   GET /api/dashboard/upcoming-classes
// @access  Private (Admin)
exports.getUpcomingClasses = async (req, res) => {
  try {
    const classes = await LiveClass.findAll({
      where: { scheduled_at: { [Op.gte]: new Date() } },
      limit: 5,
      order: [['scheduled_at', 'ASC']],
      include: [{ model: Course, attributes: ['title'] }],
    });
    success(res, classes);
  } catch (err) {
    error(res, err.message);
  }
};
