const jwt = require('jsonwebtoken');
const { Student } = require('../models');
const { success, error } = require('../utils/response');
const { Op } = require('sequelize');

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

  console.log("controller res here");
  console.log("email : " + email);
  console.log("password : " + password);
  console.log("phone : " + phone);
  console.log("name : " + name);
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
// Supports two login modes:
//   1. Admin-created students: { name: "Vinothkumar S", password: "9876543210" }
//   2. Self-registered students (legacy): { email: "...", password: "..." }
exports.login = async (req, res) => {
  const { email, name, password } = req.body;

  try {
    if (!password) {
      return error(res, 'Please provide a password', 400);
    }

    let student = null;

    if (name) {
      // Name-based login (admin-created students)
      // Case-insensitive match so capitalisation differences don't matter
      student = await Student.findOne({
        where: { name: { [Op.like]: name.trim() } }
      });
      if (!student) {
        console.log(`❌ Login failed: Student not found by name (${name})`);
        return error(res, 'Invalid credentials', 401);
      }
    } else if (email) {
      // Email login (self-registered / legacy students)
      student = await Student.findOne({ where: { email } });
      if (!student) {
        console.log(`❌ Login failed: Student not found (${email})`);
        return error(res, 'Invalid credentials', 401);
      }
    } else {
      return error(res, 'Please provide your full name or email', 400);
    }

    const isMatch = await student.matchPassword(password);
    if (!isMatch) {
      console.log(`❌ Login failed: Password mismatch for student ${student.id}`);
      return error(res, 'Invalid credentials', 401);
    }

    if (!student.is_active) {
      return error(res, 'Your account has been deactivated. Contact your administrator.', 403);
    }

    const token = generateToken(student.id);

    success(res, {
      id: student.id,
      name: student.name,
      email: student.email,
      mobile_number: student.mobile_number,
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
