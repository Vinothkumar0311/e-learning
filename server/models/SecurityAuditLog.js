const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SecurityAuditLog = sequelize.define('SecurityAuditLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  student_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  event_type: {
    type: DataTypes.ENUM(
      'LOGIN_SUCCESS',
      'LOGIN_BLOCKED_DEVICE',
      'LOGIN_FAILED',
      'DEVICE_MISMATCH',
      'TOKEN_EXPIRED',
      'SCREENSHOT_ATTEMPT',
      'SCREEN_RECORD_ATTEMPT',
      'ACCOUNT_DEACTIVATED',
      'ADMIN_FORCE_LOGOUT',
      'ADMIN_REACTIVATED'
    ),
    allowNull: false
  },
  device_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  device_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ip_address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  details: {
    type: DataTypes.JSON,
    allowNull: true
  }
});

module.exports = SecurityAuditLog;
