const sequelize = require('../config/database');
const User = require('./User');
const Course = require('./Course');
const CourseModule = require('./CourseModule');
const Student = require('./Student');
const Enrollment = require('./Enrollment');
const Payment = require('./Payment');
const LiveClass = require('./LiveClass');
const Attendance = require('./Attendance');
const Material = require('./Material');
const Notification = require('./Notification');

// --- Associations ---

// Course <-> CourseModule
Course.hasMany(CourseModule, { foreignKey: 'course_id', as: 'modules' });
CourseModule.belongsTo(Course, { foreignKey: 'course_id' });

// Student <-> Enrollment
Student.hasMany(Enrollment, { foreignKey: 'student_id' });
Enrollment.belongsTo(Student, { foreignKey: 'student_id' });

// Course <-> Enrollment
Course.hasMany(Enrollment, { foreignKey: 'course_id' });
Enrollment.belongsTo(Course, { foreignKey: 'course_id' });

// Enrollment <-> Payment
Enrollment.hasMany(Payment, { foreignKey: 'enrollment_id' });
Payment.belongsTo(Enrollment, { foreignKey: 'enrollment_id' });

// Student <-> Payment
Student.hasMany(Payment, { foreignKey: 'student_id' });
Payment.belongsTo(Student, { foreignKey: 'student_id' });

// Course <-> LiveClass
Course.hasMany(LiveClass, { foreignKey: 'course_id' });
LiveClass.belongsTo(Course, { foreignKey: 'course_id' });

// User (Admin) <-> LiveClass (Instructor)
User.hasMany(LiveClass, { foreignKey: 'instructor_id' });
LiveClass.belongsTo(User, { foreignKey: 'instructor_id', as: 'instructor' });

// LiveClass <-> Attendance
LiveClass.hasMany(Attendance, { foreignKey: 'live_class_id' });
Attendance.belongsTo(LiveClass, { foreignKey: 'live_class_id' });

// Student <-> Attendance
Student.hasMany(Attendance, { foreignKey: 'student_id' });
Attendance.belongsTo(Student, { foreignKey: 'student_id' });

// Course <-> Material
Course.hasMany(Material, { foreignKey: 'course_id' });
Material.belongsTo(Course, { foreignKey: 'course_id' });

// User <-> Notification (Sent By)
User.hasMany(Notification, { foreignKey: 'sent_by' });
Notification.belongsTo(User, { foreignKey: 'sent_by', as: 'sender' });

module.exports = {
  sequelize,
  User,
  Course,
  CourseModule,
  Student,
  Enrollment,
  Payment,
  LiveClass,
  Attendance,
  Material,
  Notification
};
