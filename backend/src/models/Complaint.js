const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Complaint = sequelize.define('Complaint', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  studentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'students',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('maintenance', 'security', 'cleanliness', 'noise', 'other'),
    defaultValue: 'other'
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'resolved', 'closed'),
    defaultValue: 'pending'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium'
  },
  resolvedAt: {
    type: DataTypes.DATE
  },
  resolution: {
    type: DataTypes.TEXT
  },
  assignedTo: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'complaints',
  timestamps: true
});

module.exports = Complaint;