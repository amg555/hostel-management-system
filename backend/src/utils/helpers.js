const crypto = require('crypto');
const moment = require('moment');

const helpers = {
  generateOTP(length = 6) {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
  },
  
  generateToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  },
  
  generateTemporaryPassword() {
    const length = 10;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  },
  
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  },
  
  calculateLateFee(dueDate, amount) {
    const daysLate = moment().diff(moment(dueDate), 'days');
    if (daysLate <= 0) return 0;
    
    // 1% per day, max 10%
    const feePercentage = Math.min(daysLate * 0.01, 0.1);
    return Math.round(amount * feePercentage);
  },
  
  getMonthYear(date = new Date()) {
    return moment(date).format('MM-YYYY');
  },
  
  getFinancialYear(date = new Date()) {
    const year = moment(date).year();
    const month = moment(date).month();
    
    if (month < 3) {
      return `${year - 1}-${year}`;
    }
    return `${year}-${year + 1}`;
  },
  
  sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  },
  
  paginate(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    return { limit: parseInt(limit), offset };
  }
};

module.exports = helpers;