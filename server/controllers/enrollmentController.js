const { Enrollment, Student, Course } = require('../models');
const { success, error } = require('../utils/response');

const VALID_STATUSES = ['pending', 'reviewed', 'contacted', 'fee_set', 'payment_requested', 'verified', 'enrolled', 'rejected'];

// @desc    Get all enrollments
// @route   GET /api/enrollments
// @access  Private (Admin)
exports.getEnrollments = async (req, res) => {
  try {
    const { status, page = 1, limit = 15 } = req.query;
    const where = {};
    if (status) where.status = status;

    const offset = (page - 1) * limit;
    const { count, rows } = await Enrollment.findAndCountAll({
      where,
      include: [
        { model: Student, attributes: ['id', 'name', 'email', 'phone'] },
        { model: Course, attributes: ['id', 'title', 'price'] },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
    });

    success(res, { enrollments: rows, total: count, page: parseInt(page), pages: Math.ceil(count / limit) });
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Get single enrollment
// @route   GET /api/enrollments/:id
// @access  Private (Admin)
exports.getEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findByPk(req.params.id, {
      include: [
        { model: Student, attributes: { exclude: ['password'] } },
        { model: Course },
      ],
    });
    if (!enrollment) return error(res, 'Enrollment not found', 404);
    success(res, enrollment);
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Update enrollment status
// @route   PATCH /api/enrollments/:id/status
// @access  Private (Admin)
exports.updateStatus = async (req, res) => {
  try {
    const { status, notes, final_fee } = req.body;
    if (!VALID_STATUSES.includes(status)) return error(res, 'Invalid status', 400);

    const enrollment = await Enrollment.findByPk(req.params.id);
    if (!enrollment) return error(res, 'Enrollment not found', 404);

    const updates = { status };
    if (notes) updates.notes = notes;
    if (final_fee) updates.final_fee = final_fee;
    if (status === 'enrolled') updates.enrolled_at = new Date();

    await enrollment.update(updates);
    success(res, enrollment, `Status updated to ${status}`);
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Approve enrollment
// @route   POST /api/enrollments/:id/approve
// @access  Private (Admin)
exports.approveEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findByPk(req.params.id);
    if (!enrollment) return error(res, 'Enrollment not found', 404);
    await enrollment.update({ status: 'enrolled', enrolled_at: new Date() });
    success(res, enrollment, 'Enrollment approved');
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Reject enrollment
// @route   POST /api/enrollments/:id/reject
// @access  Private (Admin)
exports.rejectEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findByPk(req.params.id);
    if (!enrollment) return error(res, 'Enrollment not found', 404);
    await enrollment.update({ status: 'rejected', notes: req.body.reason });
    success(res, enrollment, 'Enrollment rejected');
  } catch (err) {
    error(res, err.message);
  }
};
