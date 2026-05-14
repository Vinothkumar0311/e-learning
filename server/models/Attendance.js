const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Attendance = sequelize.define('Attendance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  is_present: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

module.exports = Attendance;
