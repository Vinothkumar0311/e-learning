const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Enrollment = sequelize.define('Enrollment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  status: {
    type: DataTypes.ENUM(
      'pending', 
      'reviewed', 
      'contacted', 
      'fee_set', 
      'payment_requested', 
      'verified', 
      'enrolled', 
      'rejected'
    ),
    defaultValue: 'pending'
  },
  request_status: {
    type: DataTypes.ENUM(
      'Pending',
      'Reviewing',
      'Approved',
      'AmountAssigned',
      'PaymentPending',
      'PaymentSubmitted',
      'PaymentVerified',
      'Enrolled',
      'Rejected'
    ),
    defaultValue: 'Pending'
  },
  fee_status: {
    type: DataTypes.ENUM('Pending', 'Assigned', 'Partially Paid', 'Paid'),
    defaultValue: 'Pending'
  },
  payment_status: {
    type: DataTypes.ENUM('Pending', 'Submitted', 'Verified', 'Failed'),
    defaultValue: 'Pending'
  },
  approved_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  approved_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  admin_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  final_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  discount_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0.00
  },
  payment_due_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  paid_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  is_blocked: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  block_reason: {
    type: DataTypes.STRING,
    allowNull: true
  },
  enrolled_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
});

module.exports = Enrollment;

