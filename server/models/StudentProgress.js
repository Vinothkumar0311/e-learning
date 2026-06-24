const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * StudentProgress — Represents lesson/module completion records for students.
 */
const StudentProgress = sequelize.define('StudentProgress', {
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
  module_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'CourseModules', key: 'id' }
  },
  completed_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  watch_duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: 'Optional field tracking actual seconds watched'
  }
}, {
  tableName: 'StudentProgresses',
  indexes: [
    { unique: true, fields: ['student_id', 'module_id'] }
  ]
});

module.exports = StudentProgress;
