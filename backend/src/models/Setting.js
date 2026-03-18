// backend/src/models/Setting.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Setting = sequelize.define('Setting', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  group: {
    type: DataTypes.STRING,
    defaultValue: 'general'
  },
  type: {
    type: DataTypes.STRING,
    defaultValue: 'string' // string, number, boolean, json
  }
}, {
  timestamps: true,
  tableName: 'settings'
});

module.exports = Setting;
