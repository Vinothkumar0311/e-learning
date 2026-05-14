const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CourseModule = sequelize.define('CourseModule', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  type: {
    type: DataTypes.ENUM('video', 'pdf', 'quiz'),
    defaultValue: 'video'
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Duration in minutes'
  }
});

module.exports = CourseModule;
