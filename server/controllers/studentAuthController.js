const jwt = require('jsonwebtoken');
const { Student, DeviceSession, SecurityAuditLog } = require('../models');
const { success, error } = require('../utils/response');
const { Op } = require('sequelize');

const generateToken = (id, deviceId) => {
  return jwt.sign({ id, device_id: deviceId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Helper to extract client IP
const getClientIp = (req) => {
  return req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || 'Unknown';
};

// @desc    Register new student
// @route   POST /api/student/register
// @access  Public
exports.register = async (req, res) => {
  const { name, email, password, phone, device_id, device_name } = req.body;

  try {
    const studentExists = await Student.findOne({ where: { email } });

    if (studentExists) {
      return error(res, 'Student already exists', 400);
    }

    const deviceId = device_id || req.headers['x-device-id'] || 'UNKNOWN_DEVICE';
    const clientIp = getClientIp(req);

    const student = await Student.create({
      name,
      email,
      password,
      phone,
      device_id: deviceId
    });

    const token = generateToken(student.id, deviceId);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Create device session
    await DeviceSession.create({
      student_id: student.id,
      device_id: deviceId,
      device_name: device_name || 'Mobile Device',
      ip_address: clientIp,
      token_issued_at: new Date(),
      token_expires_at: expiresAt,
      is_active: true
    });

    // Log security event
    await SecurityAuditLog.create({
      student_id: student.id,
      event_type: 'LOGIN_SUCCESS',
      device_id: deviceId,
      device_name: device_name || 'Mobile Device',
      ip_address: clientIp,
      details: { mode: 'registration' }
    });

    success(res, {
      id: student.id,
      name: student.name,
      email: student.email,
      device_id: deviceId,
      token
    }, 'Student registered successfully', 201);
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Auth student & get token with Single Device Protection
// @route   POST /api/student/login
// @access  Public
exports.login = async (req, res) => {
  const { email, name, password, device_id, device_name } = req.body;
  const requestDeviceId = device_id || req.headers['x-device-id'];
  const clientIp = getClientIp(req);

  try {
    if (!password) {
      return error(res, 'Please provide a password', 400);
    }

    if (!requestDeviceId) {
      return error(res, 'Device ID is required for security validation', 400);
    }

    let student = null;

    if (name) {
      student = await Student.findOne({
        where: { name: { [Op.like]: name.trim() } }
      });
      if (!student) {
        return error(res, 'Invalid credentials', 401);
      }
    } else if (email) {
      student = await Student.findOne({ where: { email } });
      if (!student) {
        return error(res, 'Invalid credentials', 401);
      }
    } else {
      return error(res, 'Please provide your full name or email', 400);
    }

    const isMatch = await student.matchPassword(password);
    if (!isMatch) {
      await SecurityAuditLog.create({
        student_id: student.id,
        event_type: 'LOGIN_FAILED',
        device_id: requestDeviceId,
        device_name: device_name || 'Unknown Device',
        ip_address: clientIp,
        details: { reason: 'Password mismatch' }
      });
      return error(res, 'Invalid credentials', 401);
    }

    // Check account status
    if (!student.is_active) {
      const message = student.is_suspicious 
        ? 'Your account has been temporarily disabled due to security concerns.'
        : 'Your account has been deactivated. Contact your administrator.';
      return res.status(403).json({
        success: false,
        message,
        code: student.is_suspicious ? 'ACCOUNT_SUSPENDED' : 'ACCOUNT_DEACTIVATED'
      });
    }

    const maxAttempts = parseInt(process.env.MAX_DEVICE_ATTEMPTS || '3', 10);

    // Single Device check
    if (student.device_id && student.device_id !== requestDeviceId) {
      // Increment failed device attempts counter
      const updatedAttempts = (student.failed_device_attempts || 0) + 1;
      let isSuspiciousNow = false;

      if (updatedAttempts >= maxAttempts) {
        isSuspiciousNow = true;
        await student.update({
          failed_device_attempts: updatedAttempts,
          is_suspicious: true,
          is_active: false
        });

        await SecurityAuditLog.create({
          student_id: student.id,
          event_type: 'ACCOUNT_DEACTIVATED',
          device_id: requestDeviceId,
          device_name: device_name || 'Unknown Device',
          ip_address: clientIp,
          details: {
            reason: 'Exceeded maximum unauthorized device login attempts',
            attempts: updatedAttempts,
            attempted_device_id: requestDeviceId
          }
        });

        return res.status(403).json({
          success: false,
          message: 'Your account has been temporarily disabled due to security concerns.',
          code: 'ACCOUNT_SUSPENDED'
        });
      } else {
        await student.update({ failed_device_attempts: updatedAttempts });

        await SecurityAuditLog.create({
          student_id: student.id,
          event_type: 'LOGIN_BLOCKED_DEVICE',
          device_id: requestDeviceId,
          device_name: device_name || 'Unknown Device',
          ip_address: clientIp,
          details: {
            reason: 'Attempted login from unauthorized secondary device',
            active_device_id: student.device_id,
            attempted_device_id: requestDeviceId,
            attempts: updatedAttempts
          }
        });

        return res.status(403).json({
          success: false,
          message: 'This account is already active on another device. Please contact the administrator.',
          code: 'DEVICE_BLOCKED'
        });
      }
    }

    // Success login on registered or new device
    if (!student.device_id) {
      await student.update({
        device_id: requestDeviceId,
        failed_device_attempts: 0
      });
    } else {
      // Same device: reset failed attempts counter if any
      if (student.failed_device_attempts > 0) {
        await student.update({ failed_device_attempts: 0 });
      }
    }

    const token = generateToken(student.id, requestDeviceId);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Deactivate old sessions if any exist
    await DeviceSession.update(
      { is_active: false },
      { where: { student_id: student.id, is_active: true } }
    );

    // Create new active session
    await DeviceSession.create({
      student_id: student.id,
      device_id: requestDeviceId,
      device_name: device_name || 'Mobile Device',
      ip_address: clientIp,
      token_issued_at: new Date(),
      token_expires_at: expiresAt,
      is_active: true
    });

    // Record audit log
    await SecurityAuditLog.create({
      student_id: student.id,
      event_type: 'LOGIN_SUCCESS',
      device_id: requestDeviceId,
      device_name: device_name || 'Mobile Device',
      ip_address: clientIp,
      details: { login_time: new Date() }
    });

    success(res, {
      id: student.id,
      name: student.name,
      email: student.email,
      mobile_number: student.mobile_number,
      device_id: requestDeviceId,
      token
    }, 'Login successful');

  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Get current student profile & validate session
// @route   GET /api/student/me
// @access  Private (Student)
exports.getMe = async (req, res) => {
  try {
    const student = await Student.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    success(res, student);
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Logout student session
// @route   POST /api/student/logout
// @access  Private (Student)
exports.logout = async (req, res) => {
  try {
    const deviceId = req.headers['x-device-id'] || req.user.device_id;
    const clientIp = getClientIp(req);

    // Deactivate sessions
    await DeviceSession.update(
      { is_active: false },
      { where: { student_id: req.user.id, is_active: true } }
    );

    await SecurityAuditLog.create({
      student_id: req.user.id,
      event_type: 'ADMIN_FORCE_LOGOUT',
      device_id: deviceId,
      ip_address: clientIp,
      details: { initiated_by: 'user' }
    });

    success(res, null, 'Logged out successfully');
  } catch (err) {
    error(res, err.message);
  }
};
