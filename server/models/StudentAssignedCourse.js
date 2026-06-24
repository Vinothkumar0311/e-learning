const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * StudentAssignedCourse — Admin-controlled course assignment mapping.
 * This is separate from the Enrollment (payment) flow.
 * A student can only access courses that appear in this table.
 */
const StudentAssignedCourse = sequelize.define('StudentAssignedCourse', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  student_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'Students', key: 'id' }
  },
  course_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Courses', key: 'id' }
  },
  assigned_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'User (admin) ID who assigned this course'
  },
  assigned_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  indexes: [
    { unique: true, fields: ['student_id', 'course_id'] }
  ]
});

module.exports = StudentAssignedCourse;
