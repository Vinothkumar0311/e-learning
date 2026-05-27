const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PaymentAuditLog = sequelize.define('PaymentAuditLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  payment_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false
  },
  old_status: {
    type: DataTypes.STRING,
    allowNull: true
  },
  new_status: {
    type: DataTypes.STRING,
    allowNull: false
  },
  performed_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'User ID (admin) who performed this action, or null if student'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

module.exports = PaymentAuditLog;
