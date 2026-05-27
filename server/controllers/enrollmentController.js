const { Enrollment, Student, Course, Payment, sequelize } = require('../models');
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
    
    // Keep request_status and other fields synchronized with the main status
    if (status === 'enrolled') {
      updates.enrolled_at = new Date();
      updates.request_status = 'Enrolled';
      updates.fee_status = 'Paid';
      updates.payment_status = 'Verified';
    } else if (status === 'verified') {
      updates.request_status = 'PaymentVerified';
      updates.payment_status = 'Verified';
    } else if (status === 'payment_requested') {
      updates.request_status = 'Approved';
    } else if (status === 'fee_set') {
      updates.request_status = 'AmountAssigned';
      updates.fee_status = 'Assigned';
    } else if (status === 'reviewed') {
      updates.request_status = 'Reviewing';
    } else if (status === 'pending') {
      updates.request_status = 'Pending';
    } else if (status === 'rejected') {
      updates.request_status = 'Rejected';
    }

    await enrollment.update(updates);
    success(res, enrollment, `Status updated to ${status}`);
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Approve enrollment
// @route   POST /api/enrollments/:id/approve
// @route   PATCH /api/enrollments/:id/approve (new routing)
// @access  Private (Admin)
exports.approveEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findByPk(req.params.id);
    if (!enrollment) return error(res, 'Enrollment not found', 404);
    
    let finalAmount = enrollment.final_amount;
    if (finalAmount === null || finalAmount === undefined) {
      const course = await Course.findByPk(enrollment.course_id);
      finalAmount = course ? course.price : 0;
    }

    if (parseFloat(finalAmount) === 0) {
      // Free course: auto-enroll directly!
      await enrollment.update({ 
        status: 'enrolled',
        request_status: 'Enrolled',
        fee_status: 'Paid',
        payment_status: 'Verified',
        approved_by: req.user ? req.user.id : null,
        approved_at: new Date(),
        enrolled_at: new Date()
      });
      return success(res, enrollment, 'Enrollment approved and student enrolled successfully (Free Course)');
    }

    await enrollment.update({ 
      status: 'payment_requested', // compatibility
      request_status: 'Approved',
      approved_by: req.user ? req.user.id : null,
      approved_at: new Date()
    });

    await Payment.findOrCreate({
      where: { enrollment_id: enrollment.id },
      defaults: {
        student_id: enrollment.student_id,
        amount: finalAmount,
        status: 'pending',
        method: 'UPI'
      }
    });
    
    success(res, enrollment, 'Enrollment approved, awaiting payment');
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
    
    await enrollment.update({ 
      status: 'rejected', 
      request_status: 'Rejected',
      notes: req.body.reason || req.body.notes,
      admin_notes: req.body.reason || req.body.notes
    });
    
    success(res, enrollment, 'Enrollment rejected');
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Get all pending enrollments
// @route   GET /api/enrollments/pending
// @access  Private (Admin)
exports.getPendingEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.findAll({
      where: { request_status: 'Pending' },
      include: [
        { model: Student, attributes: ['id', 'name', 'email', 'phone'] },
        { model: Course, attributes: ['id', 'title', 'price'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    success(res, enrollments);
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Verify student details
// @route   PATCH /api/enrollments/:id/verify-student
// @access  Private (Admin)
exports.verifyStudent = async (req, res) => {
  try {
    const enrollment = await Enrollment.findByPk(req.params.id);
    if (!enrollment) return error(res, 'Enrollment not found', 404);

    await enrollment.update({
      request_status: 'Reviewing',
      status: 'reviewed' // compatibility
    });

    success(res, enrollment, 'Student details verified, now under review');
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Set final course amount / discount
// @route   PATCH /api/enrollments/:id/set-amount
// @access  Private (Admin)
exports.setAmount = async (req, res) => {
  const { final_amount, discount_amount, payment_due_date, admin_notes } = req.body;

  try {
    const enrollment = await Enrollment.findByPk(req.params.id);
    if (!enrollment) return error(res, 'Enrollment not found', 404);

    await enrollment.update({
      final_amount,
      discount_amount: discount_amount || 0,
      payment_due_date,
      admin_notes,
      request_status: 'AmountAssigned',
      fee_status: 'Assigned',
      status: 'fee_set' // compatibility
    });

    // If the enrollment is already approved, make sure the payment record is created or updated with the new amount
    if (enrollment.request_status === 'Approved' || enrollment.request_status === 'AmountAssigned') {
      const [payment, created] = await Payment.findOrCreate({
        where: { enrollment_id: enrollment.id },
        defaults: {
          student_id: enrollment.student_id,
          amount: final_amount || 0,
          status: 'pending',
          method: 'UPI'
        }
      });
      if (!created) {
        await payment.update({ amount: final_amount || 0 });
      }
    }

    success(res, enrollment, 'Enrollment amount and discount assigned successfully');
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Record manual payment for an enrollment
// @route   POST /api/enrollments/:id/record-payment
// @access  Private (Admin)
exports.recordPayment = async (req, res) => {
  const { amount_paid, payment_mode, remarks } = req.body;
  const t = await sequelize.transaction();

  try {
    const enrollment = await Enrollment.findByPk(req.params.id, {
      include: [Student, Course]
    });
    if (!enrollment) {
      await t.rollback();
      return error(res, 'Enrollment not found', 404);
    }

    const currentPaid = parseFloat(enrollment.paid_amount || 0);
    const finalFee = parseFloat(enrollment.final_amount || enrollment.Course?.price || 0);
    const newPaidAmount = currentPaid + parseFloat(amount_paid);

    if (newPaidAmount > finalFee) {
      await t.rollback();
      return error(res, `Paid amount (₹${newPaidAmount}) cannot exceed final course fee (₹${finalFee})`, 400);
    }

    // Determine new status
    let fee_status = enrollment.fee_status;
    let request_status = enrollment.request_status;
    let status = enrollment.status;

    if (newPaidAmount >= finalFee) {
      fee_status = 'Paid';
      request_status = 'Enrolled';
      status = 'enrolled';
    } else if (newPaidAmount > 0) {
      fee_status = 'Partially Paid';
      request_status = 'PaymentPending';
      status = 'payment_requested';
    }

    await enrollment.update({
      paid_amount: newPaidAmount,
      fee_status,
      request_status,
      status,
      payment_status: newPaidAmount >= finalFee ? 'Verified' : enrollment.payment_status,
      enrolled_at: newPaidAmount >= finalFee ? new Date() : enrollment.enrolled_at
    }, { transaction: t });

    // Create a Payment record as "paid"
    await Payment.create({
      enrollment_id: enrollment.id,
      student_id: enrollment.student_id,
      amount: parseFloat(amount_paid),
      status: 'paid',
      payment_mode: payment_mode || 'Cash/Manual',
      method: payment_mode || 'Cash/Manual',
      remarks: remarks || 'Recorded manually by Admin',
      paid_at: new Date(),
      verified_by: req.user ? req.user.id : null,
      verified_at: new Date()
    }, { transaction: t });

    await t.commit();
    success(res, enrollment, `Payment of ₹${amount_paid} recorded successfully.`);
  } catch (err) {
    await t.rollback();
    error(res, err.message);
  }
};

// @desc    Toggle block student course access
// @route   PATCH /api/enrollments/:id/block
// @access  Private (Admin)
exports.toggleBlock = async (req, res) => {
  const { is_blocked, block_reason } = req.body;

  try {
    const enrollment = await Enrollment.findByPk(req.params.id);
    if (!enrollment) return error(res, 'Enrollment not found', 404);

    await enrollment.update({
      is_blocked: !!is_blocked,
      block_reason: is_blocked ? (block_reason || 'Access suspended by Administrator') : null
    });

    success(res, enrollment, `Enrollment access successfully ${is_blocked ? 'suspended/blocked' : 'unblocked'}`);
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Send payment request for remaining or custom amount
// @route   POST /api/enrollments/:id/request-payment
// @access  Private (Admin)
exports.requestPayment = async (req, res) => {
  const { amount, remarks } = req.body;

  try {
    const enrollment = await Enrollment.findByPk(req.params.id, {
      include: [Student, Course]
    });
    if (!enrollment) return error(res, 'Enrollment not found', 404);

    const finalFee = parseFloat(enrollment.final_amount || enrollment.Course?.price || 0);
    const paidAmount = parseFloat(enrollment.paid_amount || 0);
    const remaining = Math.max(0, finalFee - paidAmount);

    if (parseFloat(amount) <= 0) {
      return error(res, 'Request amount must be greater than 0', 400);
    }

    if (parseFloat(amount) > remaining) {
      return error(res, `Request amount (₹${amount}) cannot exceed remaining balance (₹${remaining})`, 400);
    }

    // Create a new pending Payment request in the database
    const payment = await Payment.create({
      enrollment_id: enrollment.id,
      student_id: enrollment.student_id,
      amount: parseFloat(amount),
      status: 'pending',
      payment_mode: 'UPI',
      method: 'UPI',
      remarks: remarks || `Payment request for outstanding course balance`
    });

    // Update enrollment request status to PaymentPending indicating outstanding payment required
    await enrollment.update({
      request_status: 'PaymentPending',
      payment_status: 'Pending'
    });

    success(res, enrollment, `Payment request for ₹${amount} submitted successfully.`);
  } catch (err) {
    error(res, err.message);
  }
};


