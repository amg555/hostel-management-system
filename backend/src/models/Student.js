const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  studentId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  rollNumber: {
    type: DataTypes.STRING,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  alternatePhone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: true
  },
  permanentAddress: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  currentAddress: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  guardianName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  guardianPhone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  guardianRelation: {
    type: DataTypes.STRING,
    allowNull: true
  },
  bloodGroup: {
    type: DataTypes.STRING,
    allowNull: true
  },
  collegeName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  course: {
    type: DataTypes.STRING,
    allowNull: true
  },
  department: {
    type: DataTypes.STRING,
    allowNull: true
  },
  academicYear: {
    type: DataTypes.STRING,
    allowNull: true
  },
  roomId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'rooms',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
  admissionDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  customRentAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Custom rent amount for this student, overrides room rent if set'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'pending', 'vacated'),
    defaultValue: 'active'
  }
}, {
  tableName: 'students',
  timestamps: true
});

module.exports = Student;