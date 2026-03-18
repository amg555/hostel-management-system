const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Room = sequelize.define('Room', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  roomNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  floor: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 2
  },
  currentOccupancy: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  type: {
    type: DataTypes.ENUM('single', 'double', 'triple', 'dormitory'),
    defaultValue: 'double'
  },
  monthlyRent: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  building: {
    type: DataTypes.STRING,
    defaultValue: 'Main'
  },
  amenities: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('available', 'full', 'maintenance'),
    defaultValue: 'available'
  }
}, {
  tableName: 'rooms',
  timestamps: true,
  hooks: {
    beforeUpdate: (room) => {
      // Update status based on occupancy
      if (room.currentOccupancy >= room.capacity) {
        room.status = 'full';
      } else if (room.currentOccupancy < room.capacity && room.status === 'full') {
        room.status = 'available';
      }
    }
  }
});

module.exports = Room;