const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('student', 'admin', 'staff'),
    defaultValue: 'student'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  },
  resetToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  resetTokenExpiry: {
    type: DataTypes.DATE,
    allowNull: true
  },
  requirePasswordChange: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'users',
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      // Check if password is already hashed (bcrypt hashes start with $2a$ or $2b$)
      if (user.password && !user.password.match(/^\$2[aby]\$/)) {
        console.log('Hashing password for new user:', user.email);
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    beforeUpdate: async (user) => {
      // Only hash if password changed and not already hashed
      if (user.changed('password')) {
        if (!user.password.match(/^\$2[aby]\$/)) {
          console.log('Hashing password for user:', user.email);
          user.password = await bcrypt.hash(user.password, 10);
        }
      }
    }
  }
});

User.prototype.comparePassword = async function(password) {
  try {
    console.log(`Comparing password for ${this.email}`);
    const result = await bcrypt.compare(password, this.password);
    console.log(`Password comparison result: ${result}`);
    return result;
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
};

User.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  delete values.password;
  delete values.resetToken;
  delete values.resetTokenExpiry;
  return values;
};

module.exports = User;