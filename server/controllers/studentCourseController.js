const { Course, CourseModule, CourseSection, Material, Enrollment, Payment } = require('../models');
const { success, error } = require('../utils/response');
const { Op } = require('sequelize');

// @desc    Get all published courses (excludes already enrolled courses for logged-in student)
// @route   GET /api/student/courses
// @access  Public / Authenticated
exports.getCourses = async (req, res) => {
  try {
    let excludeCourseIds = [];

    // If student is authenticated, exclude their enrolled courses
    if (req.user) {
      const enrolled = await Enrollment.findAll({
        where: {
          student_id: req.user.id,
          status: { [Op.in]: ['enrolled', 'verified'] }
        },
        attributes: ['course_id']
      });
      excludeCourseIds = enrolled.map(e => e.course_id);
    }

    const whereClause = { status: 'published' };
    if (excludeCourseIds.length > 0) {
      whereClause.id = { [Op.notIn]: excludeCourseIds };
    }

    const courses = await Course.findAll({ where: whereClause });
    success(res, courses);
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Get single course with modules
// @route   GET /api/student/courses/:id
// @access  Public
exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [
        { model: CourseModule, as: 'modules' },
        {
          model: CourseSection,
          as: 'sections',
          where: { parent_id: null },
          required: false,
          include: [
            { model: CourseModule, as: 'modules' },
            {
              model: CourseSection,
              as: 'subsections',
              include: [{ model: CourseModule, as: 'modules' }]
            }
          ]
        }
      ]
    });

    if (!course) {
      return error(res, 'Course not found', 404);
    }

    const courseJson = course.toJSON();
    if (courseJson.sections) {
      courseJson.sections.sort((a, b) => (a.order || 0) - (b.order || 0));
      courseJson.sections.forEach(sec => {
        if (sec.modules) sec.modules.sort((a, b) => (a.order || 0) - (b.order || 0));
        if (sec.subsections) {
          sec.subsections.sort((a, b) => (a.order || 0) - (b.order || 0));
          sec.subsections.forEach(sub => {
            if (sub.modules) sub.modules.sort((a, b) => (a.order || 0) - (b.order || 0));
          });
        }
      });
    }

    success(res, courseJson);
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Get only fully enrolled (purchased) courses for "My Courses" tab
// @route   GET /api/student/my-courses
// @access  Private (Student)
exports.getMyCourses = async (req, res) => {
  try {
    const enrollments = await Enrollment.findAll({
      where: {
        student_id: req.user.id,
        [Op.or]: [
          { status: 'enrolled' },
          { status: 'verified' },
          { request_status: 'Enrolled' },
          { request_status: 'PaymentVerified' },
          { payment_status: 'Verified' }
        ]
      },
      include: [
        {
          model: Course,
          include: [
            { model: CourseModule, as: 'modules' },
            {
              model: CourseSection,
              as: 'sections',
              where: { parent_id: null },
              required: false,
              include: [
                { model: CourseModule, as: 'modules' },
                {
                  model: CourseSection,
                  as: 'subsections',
                  include: [{ model: CourseModule, as: 'modules' }]
                }
              ]
            }
          ]
        },
        { model: Payment }
      ]
    });

    // Shape response: return course objects enriched with enrollment meta
    const myCourses = enrollments
      .filter(e => e.Course !== null)
      .map(e => {
        const course = e.Course.toJSON();

        // Sort sections/modules
        if (course.sections) {
          course.sections.sort((a, b) => (a.order || 0) - (b.order || 0));
          course.sections.forEach(sec => {
            if (sec.modules) sec.modules.sort((a, b) => (a.order || 0) - (b.order || 0));
            if (sec.subsections) {
              sec.subsections.sort((a, b) => (a.order || 0) - (b.order || 0));
              sec.subsections.forEach(sub => {
                if (sub.modules) sub.modules.sort((a, b) => (a.order || 0) - (b.order || 0));
              });
            }
          });
        }

        return {
          ...course,
          enrollmentId: e.id,
          enrolledAt: e.enrolled_at,
          requestStatus: e.request_status,
          paymentStatus: e.payment_status,
          finalAmount: e.final_amount,
          paidAmount: e.paid_amount,
          remainingAmount: Math.max(0, parseFloat(e.final_amount || (e.Course ? e.Course.price : 0) || 0) - parseFloat(e.paid_amount || 0)),
          isBlocked: e.is_blocked,
          blockReason: e.block_reason,
          payment: e.Payments && e.Payments.length > 0 ? e.Payments[0] : null
        };
      });

    success(res, myCourses);
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Get course materials (Enrolled only)
// @route   GET /api/student/courses/:id/materials
// @access  Private (Student)
exports.getCourseMaterials = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      where: {
        student_id: req.user.id,
        course_id: req.params.id,
        [Op.or]: [{ status: 'enrolled' }, { status: 'verified' }, { request_status: 'Enrolled' }]
      }
    });

    if (!enrollment) {
      return error(res, 'You are not enrolled in this course', 403);
    }

    const materials = await Material.findAll({ where: { course_id: req.params.id } });
    success(res, materials);
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Submit enrollment request
// @route   POST /api/student/enroll
// @access  Private (Student)
exports.requestEnrollment = async (req, res) => {
  const { course_id } = req.body;

  try {
    const course = await Course.findByPk(course_id);
    if (!course) return error(res, 'Course not found', 404);

    const existing = await Enrollment.findOne({ where: { student_id: req.user.id, course_id } });

    if (existing) {
      const s = (existing.request_status || existing.status || '').toLowerCase();
      if (s === 'enrolled' || s === 'paymentverified') {
        return error(res, 'You have already purchased this course', 400);
      }
      return error(res, 'An enrollment request already exists for this course', 400);
    }

    const enrollment = await Enrollment.create({
      student_id: req.user.id,
      course_id,
      status: 'pending',
      request_status: 'Pending',
      fee_status: 'Pending',
      payment_status: 'Pending'
    });

    success(res, enrollment, 'Enrollment request submitted successfully', 201);
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Get my enrollments (all statuses — for Enrollment Status tracker)
// @route   GET /api/student/my-enrollments
// @access  Private (Student)
exports.getMyEnrollments = async (req, res) => {
  try {
    let enrollments = await Enrollment.findAll({
      where: { student_id: req.user.id },
      include: [{ model: Course }, { model: Payment }]
    });

    // Auto-create missing payment records for approved enrollments
    let detailsChanged = false;
    for (const enrollment of enrollments) {
      if (['Approved', 'AmountAssigned'].includes(enrollment.request_status)) {
        const hasPayment = enrollment.Payments && enrollment.Payments.length > 0;
        if (!hasPayment) {
          let finalAmount = enrollment.final_amount;
          if (finalAmount === null || finalAmount === undefined) {
            finalAmount = enrollment.Course ? enrollment.Course.price : 0;
          }
          await Payment.create({
            enrollment_id: enrollment.id,
            student_id: enrollment.student_id,
            amount: finalAmount,
            status: 'pending',
            method: 'UPI'
          });
          detailsChanged = true;
        }
      }
    }

    if (detailsChanged) {
      enrollments = await Enrollment.findAll({
        where: { student_id: req.user.id },
        include: [{ model: Course }, { model: Payment }]
      });
    }

    success(res, enrollments);
  } catch (err) {
    error(res, err.message);
  }
};
