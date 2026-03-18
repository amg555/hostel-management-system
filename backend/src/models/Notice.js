const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notice = sequelize.define('Notice', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('general', 'urgent', 'maintenance', 'event'),
    defaultValue: 'general'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium'
  },
  targetAudience: {
    type: DataTypes.ENUM('all', 'students', 'staff'),
    defaultValue: 'all'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  publishedBy: {
    type: DataTypes.UUID,
    allowNull: true,  // Make it nullable temporarily
    references: {
      model: 'users',
      key: 'id'
    }
  },
  createdBy: {
    type: DataTypes.STRING
  },
  validFrom: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  validUntil: {
    type: DataTypes.DATE,
    allowNull: true
  },
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'notices',
  timestamps: true
});

module.exports = Notice;