const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { success, error } = require('../utils/response');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Auth admin & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return error(res, 'Please provide an email and password', 400);
    }

    const user = await User.findOne({ where: { email } });

    if (!user || !(await user.matchPassword(password))) {
      return error(res, 'Invalid credentials', 401);
    }

    const token = generateToken(user.id);

    success(res, {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    }, 'Login successful');
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    success(res, user);
  } catch (err) {
    error(res, err.message);
  }
};
