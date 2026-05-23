const jwt = require('jsonwebtoken');
const { Student } = require('../models');
const { success, error } = require('../utils/response');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Register new student
// @route   POST /api/student/register
// @access  Public
exports.register = async (req, res) => {
  const { name, email, password, phone } = req.body;

  try {
    const studentExists = await Student.findOne({ where: { email } });

    if (studentExists) {
      return error(res, 'Student already exists', 400);
    }

    const student = await Student.create({
      name,
      email,
      password,
      phone
    });

    const token = generateToken(student.id);

    success(res, {
      id: student.id,
      name: student.name,
      email: student.email,
      token
    }, 'Student registered successfully', 201);
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Auth student & get token
// @route   POST /api/student/login
// @access  Public
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return error(res, 'Please provide an email and password', 400);
    }

    const student = await Student.findOne({ where: { email } });

    if (!student) {
      console.log(`❌ Login failed: Student not found (${email})`);
      return error(res, 'Invalid credentials', 401);
    }

    const isMatch = await student.matchPassword(password);
    if (!isMatch) {
      console.log(`❌ Login failed: Password mismatch for ${email}`);
      return error(res, 'Invalid credentials', 401);
    }

    const token = generateToken(student.id);

    success(res, {
      id: student.id,
      name: student.name,
      email: student.email,
      token
    }, 'Login successful');
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Get current student profile
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
