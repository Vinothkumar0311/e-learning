const jwt = require('jsonwebtoken');
const { User, Student, DeviceSession, SecurityAuditLog } = require('../models');
const { error } = require('../utils/response');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return error(res, 'Not authorized to access this route', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findByPk(decoded.id);
    
    if (!req.user || !req.user.is_active) {
      return error(res, 'User no longer exists or is inactive', 401);
    }
    
    next();
  } catch (err) {
    return error(res, 'Not authorized to access this route', 401);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return error(res, `User role ${req.user.role} is not authorized to access this route`, 403);
    }
    next();
  };
};

const studentProtect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
      code: 'NO_TOKEN'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const student = await Student.findByPk(decoded.id);

    if (!student) {
      return res.status(401).json({
        success: false,
        message: 'Student account no longer exists',
        code: 'USER_NOT_FOUND'
      });
    }

    if (!student.is_active) {
      return res.status(403).json({
        success: false,
        message: student.is_suspicious 
          ? 'Your account has been temporarily disabled due to security concerns.'
          : 'Your account has been deactivated. Contact your administrator.',
        code: student.is_suspicious ? 'ACCOUNT_SUSPENDED' : 'ACCOUNT_DEACTIVATED'
      });
    }

    // Single device validation on API requests
    const headerDeviceId = req.headers['x-device-id'];
    const sessionDeviceId = headerDeviceId || decoded.device_id;

    if (student.device_id && sessionDeviceId && student.device_id !== sessionDeviceId) {
      // Record security log for unauthorized request attempt
      await SecurityAuditLog.create({
        student_id: student.id,
        event_type: 'DEVICE_MISMATCH',
        device_id: sessionDeviceId,
        ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip,
        details: {
          path: req.originalUrl,
          registered_device: student.device_id,
          request_device: sessionDeviceId
        }
      }).catch(() => {});

      return res.status(401).json({
        success: false,
        message: 'This account is active on another device. Access denied.',
        code: 'DEVICE_MISMATCH'
      });
    }

    // Update last_seen on active session asynchronously
    DeviceSession.update(
      { last_seen: new Date() },
      { where: { student_id: student.id, is_active: true } }
    ).catch(() => {});

    req.user = student;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Authentication token has expired. Please log in again.',
        code: 'TOKEN_EXPIRED'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization token',
      code: 'INVALID_TOKEN'
    });
  }
};

// Optional auth: populates req.user if token is present but does NOT reject unauthenticated requests
const optionalStudentProtect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const student = await Student.findByPk(decoded.id);
      if (student && student.is_active) {
        req.user = student;
      }
    }
  } catch (_) {
    // Token invalid or expired — proceed as unauthenticated, no error thrown
  }
  next();
};

module.exports = { protect, authorize, studentProtect, optionalStudentProtect };
