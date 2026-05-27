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
  },
  section_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  topic_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  youtube_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  file_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  thumbnail: {
    type: DataTypes.STRING,
    allowNull: true
  },
  is_preview: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_free: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'false = Premium (paid), true = Free (visible to all)'
  }
});

module.exports = CourseModule;

