const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Material = sequelize.define('Material', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  file_url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  file_type: {
    type: DataTypes.ENUM('pdf', 'video', 'zip', 'doc'),
    allowNull: false
  },
  file_size: {
    type: DataTypes.STRING,
    allowNull: true
  },
  download_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_free: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'false = Premium (paid), true = Free (visible to all)'
  }
});

module.exports = Material;
