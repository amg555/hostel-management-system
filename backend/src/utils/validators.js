// src/utils/validators.js
const moment = require('moment');

const validators = {
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  isValidPhone(phone) {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  },
  
  isValidDate(date) {
    return moment(date, 'YYYY-MM-DD', true).isValid();
  },
  
  isValidStudentId(studentId) {
    const idRegex = /^STU\d{8}$/;
    return idRegex.test(studentId);
  },
  
  isValidRoomNumber(roomNumber) {
    const roomRegex = /^[A-Z]-\d{3}$/;
    return roomRegex.test(roomNumber);
  },
  
  isValidAmount(amount) {
    return !isNaN(amount) && amount > 0;
  },
  
  isStrongPassword(password) {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }
};

module.exports = validators;