const { DeviceSession, SecurityAuditLog, Student } = require('../models');
const { success, error } = require('../utils/response');
const { Op } = require('sequelize');

// Helper to extract client IP
const getClientIp = (req) => {
  return req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || 'Unknown';
};

// @desc    Get all active sessions for admin monitoring
// @route   GET /api/security/sessions
// @access  Private (Admin)
exports.getActiveSessions = async (req, res) => {
  try {
    const sessions = await DeviceSession.findAll({
      where: { is_active: true },
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email', 'mobile_number', 'is_active', 'is_suspicious']
        }
      ],
      order: [['last_seen', 'DESC']]
    });

    success(res, sessions, 'Active sessions retrieved successfully');
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Force logout a student session from Admin panel
// @route   DELETE /api/security/sessions/:id
// @access  Private (Admin)
exports.forceLogoutSession = async (req, res) => {
  const { id } = req.params;

  try {
    const session = await DeviceSession.findByPk(id, {
      include: [{ model: Student, as: 'student' }]
    });

    if (!session) {
      return error(res, 'Session not found', 404);
    }

    // Deactivate session
    await session.update({ is_active: false });

    // Reset student active device ID so student can re-login if approved
    if (session.student) {
      await Student.update(
        { device_id: null, failed_device_attempts: 0 },
        { where: { id: session.student_id } }
      );
    }

    // Audit log
    await SecurityAuditLog.create({
      student_id: session.student_id,
      event_type: 'ADMIN_FORCE_LOGOUT',
      device_id: session.device_id,
      device_name: session.device_name,
      ip_address: getClientIp(req),
      details: {
        admin_id: req.user ? req.user.id : null,
        admin_name: req.user ? req.user.name : 'Admin',
        session_id: id
      }
    });

    success(res, null, 'Session terminated and user logged out successfully');
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Get security audit logs for admin review
// @route   GET /api/security/audit-logs
// @access  Private (Admin)
exports.getAuditLogs = async (req, res) => {
  const { event_type, student_id, page = 1, limit = 50, search } = req.query;

  try {
    const where = {};
    if (event_type) {
      where.event_type = event_type;
    }
    if (student_id) {
      where.student_id = student_id;
    }

    const studentWhere = {};
    if (search) {
      studentWhere[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const { count, rows } = await SecurityAuditLog.findAndCountAll({
      where,
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email', 'mobile_number'],
          where: Object.keys(studentWhere).length > 0 ? studentWhere : undefined,
          required: Object.keys(studentWhere).length > 0
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit, 10),
      offset
    });

    success(res, {
      total: count,
      page: parseInt(page, 10),
      totalPages: Math.ceil(count / limit),
      logs: rows
    }, 'Audit logs retrieved successfully');
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Admin review and reactivate a suspended/deactivated student account
// @route   POST /api/security/students/:id/reactivate
// @access  Private (Admin)
exports.reactivateStudent = async (req, res) => {
  const { id } = req.params;

  try {
    const student = await Student.findByPk(id);

    if (!student) {
      return error(res, 'Student not found', 404);
    }

    // Reset student status & device lock
    await student.update({
      is_active: true,
      is_suspicious: false,
      failed_device_attempts: 0,
      device_id: null // Allows student to register new device on next login
    });

    // Invalidate old device sessions
    await DeviceSession.update(
      { is_active: false },
      { where: { student_id: id } }
    );

    // Audit log
    await SecurityAuditLog.create({
      student_id: id,
      event_type: 'ADMIN_REACTIVATED',
      ip_address: getClientIp(req),
      details: {
        admin_id: req.user ? req.user.id : null,
        admin_name: req.user ? req.user.name : 'Admin',
        reactivated_at: new Date()
      }
    });

    success(res, student, 'Student account reactivated successfully. Device lock cleared.');
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Log client security events (screenshots, screen recording detections)
// @route   POST /api/security/log
// @access  Private (Student)
exports.logClientSecurityEvent = async (req, res) => {
  const { event_type, details, device_name } = req.body;
  const requestDeviceId = req.headers['x-device-id'] || (req.user ? req.user.device_id : 'UNKNOWN');

  try {
    const validEvents = ['SCREENSHOT_ATTEMPT', 'SCREEN_RECORD_ATTEMPT'];
    if (!validEvents.includes(event_type)) {
      return error(res, 'Invalid event type', 400);
    }

    await SecurityAuditLog.create({
      student_id: req.user.id,
      event_type,
      device_id: requestDeviceId,
      device_name: device_name || 'Mobile App',
      ip_address: getClientIp(req),
      details: details || {}
    });

    success(res, null, 'Security event logged successfully');
  } catch (err) {
    error(res, err.message);
  }
};
