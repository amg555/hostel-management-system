const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  studentId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  paymentType: {
    type: DataTypes.ENUM('rent', 'deposit', 'maintenance', 'other'),
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'bank_transfer', 'online'),
    defaultValue: 'cash'
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed'),
    defaultValue: 'pending'
  },
  transactionId: {
    type: DataTypes.STRING
  },
  dueDate: {
    type: DataTypes.DATE
  },
  paidDate: {
    type: DataTypes.DATE
  },
  description: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'payments',
  timestamps: true
});

module.exports = Payment;