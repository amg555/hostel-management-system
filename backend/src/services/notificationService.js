// src/services/notificationService.js
const nodemailer = require('nodemailer');
const { User, Student } = require('../models');
const logger = require('../utils/logger');

class NotificationService {
  constructor() {
    this.emailTransporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
  
  async sendEmail(to, subject, html) {
    try {
      const mailOptions = {
        from: `"Hostel Management" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html
      };
      
      const info = await this.emailTransporter.sendMail(mailOptions);
      logger.info(`Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error('Email sending failed:', error);
      throw error;
    }
  }
  
  async sendNotification(email, title, message) {
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>${title}</h2>
        <p>${message}</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          This is an automated message from Hostel Management System.
        </p>
      </div>
    `;
    
    return this.sendEmail(email, title, html);
  }
  
  async notifyAdmins(title, message) {
    try {
      const admins = await User.findAll({
        where: { role: 'admin', isActive: true }
      });
      
      const promises = admins.map(admin => 
        this.sendNotification(admin.email, title, message)
      );
      
      await Promise.all(promises);
      logger.info(`Admin notifications sent for: ${title}`);
    } catch (error) {
      logger.error('Failed to notify admins:', error);
    }
  }
  
  async notifyAllStudents(title, message) {
    try {
      const students = await Student.findAll({
        where: { status: 'active' },
        include: ['user']
      });
      
      const promises = students
        .filter(s => s.user && s.user.email)
        .map(student => 
          this.sendNotification(student.user.email, title, message)
        );
      
      await Promise.all(promises);
      logger.info(`Student notifications sent for: ${title}`);
    } catch (error) {
      logger.error('Failed to notify students:', error);
    }
  }
  
  async sendPaymentReminder(student, amount, dueDate) {
    const message = `
      Dear ${student.fullName},<br><br>
      This is a reminder that your hostel fee payment of <strong>₹${amount}</strong> 
      is due on <strong>${dueDate}</strong>.<br><br>
      Please make the payment on time to avoid late fees.<br><br>
      Thank you,<br>
      Hostel Management
    `;
    
    return this.sendNotification(
      student.email,
      'Payment Reminder',
      message
    );
  }
  
  async sendPaymentConfirmation(payment) {
    const student = await Student.findByPk(payment.studentId);
    
    const message = `
      Dear ${student.fullName},<br><br>
      Your payment has been successfully recorded:<br><br>
      <strong>Receipt Number:</strong> ${payment.receiptNumber}<br>
      <strong>Amount:</strong> ₹${payment.amount}<br>
      <strong>Date:</strong> ${new Date(payment.paymentDate).toLocaleDateString()}<br>
      <strong>Payment Method:</strong> ${payment.paymentMethod}<br><br>
      Thank you for your payment.<br><br>
      Hostel Management
    `;
    
    return this.sendNotification(
      student.email,
      'Payment Confirmation',
      message
    );
  }
}

module.exports = new NotificationService();