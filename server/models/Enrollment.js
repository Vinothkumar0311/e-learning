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
  final_fee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  enrolled_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
});

module.exports = Enrollment;
