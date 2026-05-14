const jwt = require('jsonwebtoken');
const { User, Student } = require('../models');
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
    return error(res, 'Not authorized to access this route', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await Student.findByPk(decoded.id);
    
    if (!req.user || !req.user.is_active) {
      return error(res, 'Student no longer exists or is inactive', 401);
    }
    
    next();
  } catch (err) {
    return error(res, 'Not authorized to access this route', 401);
  }
};

module.exports = { protect, authorize, studentProtect };
