const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LiveClass = sequelize.define('LiveClass', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  batch: {
    type: DataTypes.STRING,
    allowNull: false
  },
  scheduled_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  duration_mins: {
    type: DataTypes.INTEGER,
    defaultValue: 60
  },
  meeting_link: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'live', 'completed', 'cancelled'),
    defaultValue: 'scheduled'
  }
});

module.exports = LiveClass;
