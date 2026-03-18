// backend/src/models/Movement.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Movement = sequelize.define('Movement', {
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
  type: {
    type: DataTypes.ENUM('check_out', 'check_in', 'home_leave', 'home_return'),
    allowNull: false
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: false
  },
  destination: {
    type: DataTypes.STRING,
    allowNull: true
  },
  checkOutTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  expectedReturnTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  checkInTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  actualReturnTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'completed', 'active'),
    defaultValue: 'pending'
  },
  approvedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  emergencyContact: {
    type: DataTypes.STRING,
    allowNull: true
  },
  transportMode: {
    type: DataTypes.ENUM('bus', 'train', 'flight', 'car', 'other'),
    allowNull: true
  }
}, {
  tableName: 'movements',
  timestamps: true
});

module.exports = Movement;