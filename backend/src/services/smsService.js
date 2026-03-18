// src/services/smsService.js
const axios = require('axios');
const logger = require('../utils/logger');

class SMSService {
  constructor() {
    this.apiKey = process.env.SMS_API_KEY;
    this.senderId = process.env.SMS_SENDER_ID || 'HOSTEL';
    this.apiUrl = process.env.SMS_API_URL;
  }
  
  async sendSMS(phone, message) {
    try {
      if (!this.apiKey || !this.apiUrl) {
        logger.warn('SMS service not configured');
        return;
      }
      
      const response = await axios.post(this.apiUrl, {
        apikey: this.apiKey,
        sender: this.senderId,
        number: phone,
        message: message
      });
      
      logger.info(`SMS sent to ${phone}`);
      return response.data;
    } catch (error) {
      logger.error('SMS sending failed:', error);
      throw error;
    }
  }
  
  async sendOTP(phone, otp) {
    const message = `Your OTP for Hostel Management System is: ${otp}. Valid for 10 minutes.`;
    return this.sendSMS(phone, message);
  }
  
  async sendPaymentReminder(phone, amount, dueDate) {
    const message = `Reminder: Your hostel fee of Rs.${amount} is due on ${dueDate}. Please pay on time.`;
    return this.sendSMS(phone, message);
  }
}

module.exports = new SMSService();