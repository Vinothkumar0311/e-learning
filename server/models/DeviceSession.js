const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DeviceSession = sequelize.define('DeviceSession', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  student_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  device_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  device_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ip_address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  login_time: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  last_seen: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  token_issued_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  token_expires_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
});

module.exports = DeviceSession;
