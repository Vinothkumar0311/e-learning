const { Payment, PaymentAuditLog, Enrollment, Student, Course, User, sequelize } = require('../models');
const { success, error } = require('../utils/response');
const { Op } = require('sequelize');

// @desc    Get all payments (paginated, filtered, searchable)
// @route   GET /api/payments
// @access  Private (Admin)
exports.getPayments = async (req, res) => {
  try {
    const { status, payment_mode, search, startDate, endDate, page = 1, limit = 15 } = req.query;
    const where = {};
    
    if (status) where.status = status;
    if (payment_mode) where.payment_mode = payment_mode;
    
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const studentWhere = {};
    if (search) {
      studentWhere[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;
    const { count, rows } = await Payment.findAndCountAll({
      where,
      include: [
        { 
          model: Student, 
          where: search ? studentWhere : undefined,
          attributes: ['id', 'name', 'email', 'phone'] 
        },
        { 
          model: Enrollment,
          include: [{ model: Course, attributes: ['id', 'title'] }]
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    success(res, { 
      payments: rows, 
      total: count, 
      page: parseInt(page), 
      pages: Math.ceil(count / limit) 
    });
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Get payments ledger student-wise
// @route   GET /api/payments/ledger
// @access  Private (Admin)
exports.getPaymentLedger = async (req, res) => {
  try {
    const { student_id } = req.query;
    if (!student_id) return error(res, 'Student ID is required', 400);

    const payments = await Payment.findAll({
      where: { student_id },
      include: [
        { 
          model: Enrollment,
          include: [{ model: Course, attributes: ['id', 'title'] }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    success(res, payments);
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Get payment details with audits
// @route   GET /api/payments/:id
// @access  Private (Admin)
exports.getPayment = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id, {
      include: [
        { model: Student, attributes: ['id', 'name', 'email', 'phone'] },
        { model: Enrollment, include: [{ model: Course }] },
        { 
          model: PaymentAuditLog, 
          as: 'auditLogs',
          include: [{ model: User, as: 'performedBy', attributes: ['id', 'name', 'email'] }]
        }
      ]
    });

    if (!payment) return error(res, 'Payment record not found', 404);
    success(res, payment);
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Verify payment and trigger auto enrollment
// @route   PATCH /api/payments/:id/verify
// @access  Private (Admin)
exports.verifyPayment = async (req, res) => {
  const { remarks, status = 'paid' } = req.body; // status can be 'paid' or 'failed'
  const t = await sequelize.transaction();

  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) {
      await t.rollback();
      return error(res, 'Payment not found', 404);
    }

    const oldStatus = payment.status;
    const adminId = req.user ? req.user.id : null;

    // Update payment record
    await payment.update({
      status: status === 'paid' ? 'paid' : 'failed',
      verified_by: adminId,
      verified_at: new Date(),
      remarks: remarks || payment.remarks,
      rejected_reason: status === 'failed' ? remarks : null
    }, { transaction: t });

    // Update linked enrollment workflow
    if (payment.enrollment_id) {
      const enrollment = await Enrollment.findByPk(payment.enrollment_id);
      if (enrollment) {
        if (status === 'paid') {
          const paymentAmount = parseFloat(payment.amount || 0);
          const currentPaid = parseFloat(enrollment.paid_amount || 0);
          const finalFee = parseFloat(enrollment.final_amount || paymentAmount);
          const newPaidAmount = Math.min(finalFee, currentPaid + paymentAmount);
          const isFullyPaid = newPaidAmount >= finalFee;

          await enrollment.update({
            status: isFullyPaid ? 'enrolled' : 'payment_requested', // compatibility
            request_status: isFullyPaid ? 'Enrolled' : 'PaymentPending',
            fee_status: isFullyPaid ? 'Paid' : 'Partially Paid',
            payment_status: isFullyPaid ? 'Verified' : enrollment.payment_status,
            paid_amount: newPaidAmount,
            enrolled_at: isFullyPaid ? new Date() : enrollment.enrolled_at
          }, { transaction: t });
        } else {
          await enrollment.update({
            status: 'rejected',
            payment_status: 'Failed',
            request_status: 'Rejected', // or keep as PaymentPending but marked failed
            admin_notes: `Payment verification failed: ${remarks}`
          }, { transaction: t });
        }
      }
    }

    // Write audit log
    await PaymentAuditLog.create({
      payment_id: payment.id,
      action: status === 'paid' ? 'VERIFIED' : 'REJECTED_VERIFICATION',
      old_status: oldStatus,
      new_status: payment.status,
      performed_by: adminId,
      notes: remarks || 'Payment verification completed'
    }, { transaction: t });

    await t.commit();
    success(res, payment, `Payment successfully ${status === 'paid' ? 'verified' : 'rejected'}`);
  } catch (err) {
    await t.rollback();
    error(res, err.message);
  }
};

// @desc    Manually update payment parameters
// @route   PATCH /api/payments/:id/manual-update
// @access  Private (Admin)
exports.manualUpdatePayment = async (req, res) => {
  const { amount, status, remarks, payment_mode, receipt_number, transaction_ref } = req.body;
  const t = await sequelize.transaction();

  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) {
      await t.rollback();
      return error(res, 'Payment not found', 404);
    }

    const oldStatus = payment.status;
    const adminId = req.user ? req.user.id : null;

    const updates = { updated_by_admin: true };
    if (amount) updates.amount = amount;
    if (status) updates.status = status;
    if (remarks) updates.remarks = remarks;
    if (payment_mode) updates.payment_mode = payment_mode;
    if (receipt_number) updates.receipt_number = receipt_number;
    if (transaction_ref) updates.transaction_ref = transaction_ref;
    if (status === 'paid') updates.paid_at = new Date();

    await payment.update(updates, { transaction: t });

    // Auto-update enrollment if marked paid
    if (payment.enrollment_id && status === 'paid') {
      const enrollment = await Enrollment.findByPk(payment.enrollment_id);
      if (enrollment) {
        await enrollment.update({
          status: 'enrolled',
          request_status: 'Enrolled',
          fee_status: 'Paid',
          payment_status: 'Verified',
          enrolled_at: new Date()
        }, { transaction: t });
      }
    }

    // Write audit log
    await PaymentAuditLog.create({
      payment_id: payment.id,
      action: 'MANUAL_UPDATE',
      old_status: oldStatus,
      new_status: payment.status,
      performed_by: adminId,
      notes: remarks || 'Manual override update by Administrator'
    }, { transaction: t });

    await t.commit();
    success(res, payment, 'Payment record updated successfully');
  } catch (err) {
    await t.rollback();
    error(res, err.message);
  }
};

// @desc    Manually record new offline/manual payment
// @route   POST /api/payments/manual
// @access  Private (Admin)
exports.createManualPayment = async (req, res) => {
  const { student_id, course_id, enrollment_id, amount, payment_mode, receipt_number, remarks, status } = req.body;
  const t = await sequelize.transaction();

  try {
    const adminId = req.user ? req.user.id : null;

    // Find or create enrollment for manual tracking
    let targetEnrollmentId = enrollment_id;
    if (!targetEnrollmentId) {
      let [enrollment] = await Enrollment.findOrCreate({
        where: { student_id, course_id },
        defaults: {
          status: status === 'paid' ? 'enrolled' : 'pending',
          request_status: status === 'paid' ? 'Enrolled' : 'Pending',
          fee_status: status === 'paid' ? 'Paid' : 'Assigned',
          payment_status: status === 'paid' ? 'Verified' : 'Pending',
          final_amount: amount,
          paid_amount: status === 'paid' ? amount : 0,
          enrolled_at: status === 'paid' ? new Date() : null
        },
        transaction: t
      });
      targetEnrollmentId = enrollment.id;
    } else {
      // If enrollment provided and status is paid, make sure it transitions
      if (status === 'paid') {
        const enr = await Enrollment.findByPk(targetEnrollmentId);
        if (enr) {
          const currentPaid = parseFloat(enr.paid_amount || 0);
          const newPaid = Math.min(parseFloat(enr.final_amount || amount), currentPaid + parseFloat(amount));
          await enr.update({
            status: 'enrolled',
            request_status: 'Enrolled',
            fee_status: 'Paid',
            payment_status: 'Verified',
            paid_amount: newPaid,
            enrolled_at: new Date()
          }, { transaction: t });
        }
      }
    }

    const payment = await Payment.create({
      enrollment_id: targetEnrollmentId,
      student_id,
      amount,
      method: payment_mode,
      payment_mode,
      receipt_number,
      remarks,
      status: status || 'pending',
      updated_by_admin: true,
      paid_at: status === 'paid' ? new Date() : null,
      verified_by: status === 'paid' ? adminId : null,
      verified_at: status === 'paid' ? new Date() : null
    }, { transaction: t });

    // Write audit log
    await PaymentAuditLog.create({
      payment_id: payment.id,
      action: 'MANUAL_CREATE',
      old_status: null,
      new_status: payment.status,
      performed_by: adminId,
      notes: remarks || 'Manual payment entry recorded'
    }, { transaction: t });

    await t.commit();
    success(res, payment, 'Offline payment recorded successfully', 201);
  } catch (err) {
    await t.rollback();
    error(res, err.message);
  }
};

// @desc    Get audit logs for a payment
// @route   GET /api/payments/:id/audit
// @access  Private (Admin)
exports.getPaymentAuditLogs = async (req, res) => {
  try {
    const logs = await PaymentAuditLog.findAll({
      where: { payment_id: req.params.id },
      include: [{ model: User, as: 'performedBy', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']]
    });
    success(res, logs);
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Export payments as CSV
// @route   GET /api/payments/export
// @access  Private (Admin)
exports.exportPaymentsCSV = async (req, res) => {
  try {
    const payments = await Payment.findAll({
      include: [
        { model: Student, attributes: ['name', 'email'] },
        { model: Enrollment, include: [{ model: Course, attributes: ['title'] }] }
      ],
      order: [['createdAt', 'DESC']]
    });

    let csvContent = 'ID,Student Name,Student Email,Course,Amount,Payment Mode,Receipt Number,Status,Date\n';
    
    payments.forEach(p => {
      const courseTitle = p.Enrollment?.Course?.title || 'Unknown';
      csvContent += `${p.id},"${p.Student?.name}","${p.Student?.email}","${courseTitle}",${p.amount},${p.payment_mode || p.method},"${p.receipt_number || ''}",${p.status},${p.createdAt.toLocaleDateString()}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=payments_export.csv');
    res.status(200).send(csvContent);
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Upload student payment proof (screenshot)
// @route   POST /api/payments/:id/proof
// @access  Private (Student)
exports.uploadPaymentProof = async (req, res) => {
  try {
    if (!req.file) {
      return error(res, 'Please upload a proof screenshot', 400);
    }

    const payment = await Payment.findByPk(req.params.id);
    if (!payment) {
      return error(res, 'Payment record not found', 404);
    }

    const proof_url = `/uploads/${req.file.filename}`;
    const oldStatus = payment.status;

    await payment.update({
      proof_url,
      status: 'pending' // awaits verification
    });

    if (payment.enrollment_id) {
      const enrollment = await Enrollment.findByPk(payment.enrollment_id);
      if (enrollment) {
        await enrollment.update({
          payment_status: 'Submitted',
          request_status: 'PaymentSubmitted'
        });
      }
    }

    // Write audit log
    await PaymentAuditLog.create({
      payment_id: payment.id,
      action: 'PROOF_UPLOADED',
      old_status: oldStatus,
      new_status: 'pending',
      notes: 'Payment screenshot proof uploaded by Student'
    });

    success(res, payment, 'Payment proof screenshot uploaded successfully');
  } catch (err) {
    error(res, err.message);
  }
};
