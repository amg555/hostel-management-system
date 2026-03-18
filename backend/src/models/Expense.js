const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Expense = sequelize.define('Expense', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  category: {
    type: DataTypes.ENUM('maintenance', 'utilities', 'salaries', 'supplies', 'other'),
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'bank_transfer', 'cheque'),
    defaultValue: 'cash'
  },
  vendor: {
    type: DataTypes.STRING
  },
  invoiceNumber: {
    type: DataTypes.STRING
  },
  approvedBy: {
    type: DataTypes.UUID
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'expenses',
  timestamps: true
});

module.exports = Expense;