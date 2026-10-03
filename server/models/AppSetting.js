const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AppSetting = sequelize.define('AppSetting', {
  key: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

module.exports = AppSetting;
