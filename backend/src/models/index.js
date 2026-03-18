const { sequelize } = require('../config/database');
const User = require('./User');
const Student = require('./Student');
const Room = require('./Room');
const Payment = require('./Payment');
const Notice = require('./Notice');
const Complaint = require('./Complaint');
const Movement = require('./Movement');
const Expense = require('./Expense');
const Setting = require('./Setting');

// Define associations

// User-Student relationship
User.hasOne(Student, { 
  foreignKey: 'userId', 
  as: 'studentProfile', 
  onDelete: 'CASCADE' 
});
Student.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user' 
});

// Room-Student relationship
Room.hasMany(Student, { 
  foreignKey: 'roomId', 
  as: 'students' 
});
Student.belongsTo(Room, { 
  foreignKey: 'roomId', 
  as: 'room' 
});

// Student-Payment relationship
Student.hasMany(Payment, { 
  foreignKey: 'studentId', 
  as: 'payments', 
  onDelete: 'CASCADE' 
});
Payment.belongsTo(Student, { 
  foreignKey: 'studentId', 
  as: 'student' 
});

// Student-Complaint relationship
Student.hasMany(Complaint, { 
  foreignKey: 'studentId', 
  as: 'complaints', 
  onDelete: 'CASCADE' 
});
Complaint.belongsTo(Student, { 
  foreignKey: 'studentId', 
  as: 'student' 
});

// Student-Movement relationship
Student.hasMany(Movement, { 
  foreignKey: 'studentId', 
  as: 'movements', 
  onDelete: 'CASCADE' 
});
Movement.belongsTo(Student, { 
  foreignKey: 'studentId', 
  as: 'student' 
});

// User-Movement relationship (for approval)
User.hasMany(Movement, { 
  foreignKey: 'approvedBy', 
  as: 'approvedMovements' 
});
Movement.belongsTo(User, { 
  foreignKey: 'approvedBy', 
  as: 'approver' 
});

// Notice-User relationship
Notice.belongsTo(User, { 
  foreignKey: 'publishedBy', 
  as: 'publisher' 
});
User.hasMany(Notice, { 
  foreignKey: 'publishedBy', 
  as: 'notices' 
});

// Complaint-User relationship (for resolution)
Complaint.belongsTo(User, { 
  foreignKey: 'resolvedBy', 
  as: 'resolver' 
});
User.hasMany(Complaint, { 
  foreignKey: 'resolvedBy', 
  as: 'resolvedComplaints' 
});

// Expense-User relationship (for recording)
Expense.belongsTo(User, { 
  foreignKey: 'recordedBy', 
  as: 'recorder' 
});
User.hasMany(Expense, { 
  foreignKey: 'recordedBy', 
  as: 'recordedExpenses' 
});

// Payment-User relationship (for collection)
Payment.belongsTo(User, { 
  foreignKey: 'collectedBy', 
  as: 'collector' 
});
User.hasMany(Payment, { 
  foreignKey: 'collectedBy', 
  as: 'collectedPayments' 
});

module.exports = {
  sequelize,
  User,
  Student,
  Room,
  Payment,
  Notice,
  Complaint,
  Movement,
  Expense,
  Setting
};