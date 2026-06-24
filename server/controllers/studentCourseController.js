const {
  Course,
  CourseModule,
  CourseSection,
  Material,
  Enrollment,
  Payment,
  StudentAssignedCourse,
} = require("../models");
const { success, error } = require("../utils/response");
const { Op } = require("sequelize");

// Helper: sort sections/modules recursively
const sortCourseContent = (courseJson) => {
  if (courseJson.sections) {
    courseJson.sections.sort((a, b) => (a.order || 0) - (b.order || 0));
    courseJson.sections.forEach((sec) => {
      if (sec.modules)
        sec.modules.sort((a, b) => (a.order || 0) - (b.order || 0));
      if (sec.subsections) {
        sec.subsections.sort((a, b) => (a.order || 0) - (b.order || 0));
        sec.subsections.forEach((sub) => {
          if (sub.modules)
            sub.modules.sort((a, b) => (a.order || 0) - (b.order || 0));
        });
      }
    });
  }
  return courseJson;
};

// Helper: build full course include (sections + modules)
const fullCourseInclude = [
  { model: CourseModule, as: "modules" },
  {
    model: CourseSection,
    as: "sections",
    where: { parent_id: null },
    required: false,
    include: [
      { model: CourseModule, as: "modules" },
      {
        model: CourseSection,
        as: "subsections",
        include: [{ model: CourseModule, as: "modules" }],
      },
    ],
  },
];

// @desc    Get all published courses (excludes already assigned courses for logged-in student)
// @route   GET /api/student/courses
// @access  Public / Authenticated
exports.getCourses = async (req, res) => {
  try {
    let excludeCourseIds = [];

    // If student is authenticated, exclude their enrolled/assigned courses
    if (req.user) {
      const assigned = await StudentAssignedCourse.findAll({
        where: { student_id: req.user.id },
        attributes: ["course_id"],
      });
      excludeCourseIds = assigned.map((a) => a.course_id);
    }

    const whereClause = { status: "published" };
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
// @access  Student (must be assigned to this course)
exports.getCourse = async (req, res) => {
  try {
    const courseId = req.params.id;

    // If student is authenticated, enforce assignment check
    if (req.user) {
      const assignment = await StudentAssignedCourse.findOne({
        where: { student_id: req.user.id, course_id: courseId },
      });
      if (!assignment) {
        return error(
          res,
          "You do not have access to this course. Please contact your administrator.",
          403,
        );
      }
    }

    const course = await Course.findByPk(courseId, {
      include: fullCourseInclude,
    });

    if (!course) {
      return error(res, "Course not found", 404);
    }

    const courseJson = sortCourseContent(course.toJSON());

    if (req.user) {
      const [enrollment] = await Enrollment.findOrCreate({
        where: { student_id: req.user.id, course_id: courseId },
        defaults: {
          status: 'enrolled',
          request_status: 'Enrolled',
          fee_status: 'Paid',
          payment_status: 'Verified',
          enrolled_at: new Date()
        }
      });

      courseJson.isBlocked = enrollment.is_blocked;
      courseJson.blockReason = enrollment.block_reason;
      
      const finalAmt = enrollment.final_amount !== null ? parseFloat(enrollment.final_amount) : parseFloat(course.price || 0);
      const paidAmt = enrollment.paid_amount !== null ? parseFloat(enrollment.paid_amount) : 0;
      
      courseJson.paidAmount = paidAmt;
      courseJson.remainingAmount = Math.max(0, finalAmt - paidAmt);
    }

    success(res, courseJson);
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Get only admin-assigned courses for "My Courses" tab
// @route   GET /api/student/my-courses
// @access  Private (Student)
exports.getMyCourses = async (req, res) => {
  try {
    const assignments = await StudentAssignedCourse.findAll({
      where: { student_id: req.user.id },
      include: [
        {
          model: Course,
          include: fullCourseInclude,
        },
      ],
      order: [["assigned_at", "DESC"]],
    });

    const myCourses = [];
    for (const a of assignments) {
      if (a.Course === null) continue;
      const course = a.Course.toJSON();
      
      const [enrollment] = await Enrollment.findOrCreate({
        where: { student_id: req.user.id, course_id: course.id },
        defaults: {
          status: 'enrolled',
          request_status: 'Enrolled',
          fee_status: 'Paid',
          payment_status: 'Verified',
          enrolled_at: a.assigned_at
        }
      });
      
      const finalAmt = enrollment.final_amount !== null ? parseFloat(enrollment.final_amount) : parseFloat(course.price || 0);
      const paidAmt = enrollment.paid_amount !== null ? parseFloat(enrollment.paid_amount) : 0;

      myCourses.push({
        ...sortCourseContent(course),
        assignedAt: a.assigned_at,
        isBlocked: enrollment.is_blocked,
        blockReason: enrollment.block_reason,
        paidAmount: paidAmt,
        remainingAmount: Math.max(0, finalAmt - paidAmt),
      });
    }

    success(res, myCourses);
  } catch (err) {
    error(res, err.message);
  }
};

// @desc    Get course materials (Assigned students only)
// @route   GET /api/student/courses/:id/materials
// @access  Private (Student)
exports.getCourseMaterials = async (req, res) => {
  try {
    // Check assignment (not enrollment) for material access
    const assignment = await StudentAssignedCourse.findOne({
      where: { student_id: req.user.id, course_id: req.params.id },
    });

    if (!assignment) {
      return error(res, "You are not assigned to this course", 403);
    }

    const materials = await Material.findAll({
      where: { course_id: req.params.id },
    });
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
    if (!course) return error(res, "Course not found", 404);

    const existing = await Enrollment.findOne({
      where: { student_id: req.user.id, course_id },
    });

    if (existing) {
      const s = (
        existing.request_status ||
        existing.status ||
        ""
      ).toLowerCase();
      if (s === "enrolled" || s === "paymentverified") {
        return error(res, "You have already purchased this course", 400);
      }
      return error(
        res,
        "An enrollment request already exists for this course",
        400,
      );
    }

    const enrollment = await Enrollment.create({
      student_id: req.user.id,
      course_id,
      status: "pending",
      request_status: "Pending",
      fee_status: "Pending",
      payment_status: "Pending",
    });

    success(res, enrollment, "Enrollment request submitted successfully", 201);
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
      include: [{ model: Course }, { model: Payment }],
    });

    // Auto-create missing payment records for approved enrollments
    let detailsChanged = false;
    for (const enrollment of enrollments) {
      if (["Approved", "AmountAssigned"].includes(enrollment.request_status)) {
        const hasPayment =
          enrollment.Payments && enrollment.Payments.length > 0;
        if (!hasPayment) {
          let finalAmount = enrollment.final_amount;
          if (finalAmount === null || finalAmount === undefined) {
            finalAmount = enrollment.Course ? enrollment.Course.price : 0;
          }
          await Payment.create({
            enrollment_id: enrollment.id,
            student_id: enrollment.student_id,
            amount: finalAmount,
            status: "pending",
            method: "UPI",
          });
          detailsChanged = true;
        }
      }
    }

    if (detailsChanged) {
      enrollments = await Enrollment.findAll({
        where: { student_id: req.user.id },
        include: [{ model: Course }, { model: Payment }],
      });
    }

    success(res, enrollments);
  } catch (err) {
    error(res, err.message);
  }
};
