const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  method: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
    defaultValue: 'pending'
  },
  proof_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  transaction_ref: {
    type: DataTypes.STRING,
    allowNull: true
  },
  verified_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  verified_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  rejected_reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  payment_mode: {
    type: DataTypes.ENUM('UPI', 'Bank Transfer', 'Cash', 'Online Gateway', 'Manual Entry'),
    allowNull: true
  },
  receipt_number: {
    type: DataTypes.STRING,
    allowNull: true
  },
  paid_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  updated_by_admin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

module.exports = Payment;

