// backend/src/services/emailService.js
const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.isConfigured = false;
    this.initializeTransporter();
  }

  initializeTransporter() {
    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      logger.warn('Email service not configured - EMAIL_USER or EMAIL_PASS missing');
      return;
    }

    try {
      this.transporter = nodemailer.createTransporter({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        tls: {
          rejectUnauthorized: false // Allow self-signed certificates
        }
      });

      // Verify the transporter configuration
      this.transporter.verify((error, success) => {
        if (error) {
          logger.error('Email transporter verification failed:', error);
          this.isConfigured = false;
        } else {
          logger.info('Email service configured successfully');
          this.isConfigured = true;
        }
      });
    } catch (error) {
      logger.error('Failed to initialize email transporter:', error);
      this.isConfigured = false;
    }
  }

  async sendEmail({ to, subject, html, attachments = [] }) {
    if (!this.isConfigured || !this.transporter) {
      logger.warn('Email service not configured, skipping email send');
      throw new Error('Email service not configured');
    }

    try {
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Hostel Management'}" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
        attachments
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully to ${to}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error('Email sending failed:', error);
      throw error;
    }
  }

  async sendStudentCredentials(email, studentId, password, name) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
          .credentials-box { background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; border: 1px solid #e0e0e0; }
          .credential-item { margin: 10px 0; padding: 10px; background-color: #f5f5f5; border-radius: 3px; }
          .credential-label { font-weight: bold; color: #555; }
          .credential-value { font-size: 16px; color: #2196F3; margin-top: 5px; font-family: monospace; }
          .warning { background-color: #fff3cd; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #ffeeba; }
          .button { display: inline-block; padding: 12px 24px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #777; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Hostel Management System</h1>
          </div>
          <div class="content">
            <p>Dear <strong>${name}</strong>,</p>
            <p>Your student account has been successfully created by the administration. Below are your login credentials:</p>
            
            <div class="credentials-box">
              <div class="credential-item">
                <div class="credential-label">Student ID:</div>
                <div class="credential-value">${studentId}</div>
              </div>
              <div class="credential-item">
                <div class="credential-label">Email (Username):</div>
                <div class="credential-value">${email}</div>
              </div>
              <div class="credential-item">
                <div class="credential-label">Temporary Password:</div>
                <div class="credential-value">${password}</div>
              </div>
            </div>
            
            <div class="warning">
              <strong>⚠️ Important Security Notice:</strong>
              <ul>
                <li>This is a temporary password that must be changed on your first login</li>
                <li>Do not share these credentials with anyone</li>
                <li>If you didn't expect this email, please contact the administration immediately</li>
              </ul>
            </div>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/student-login" class="button">
                Login to Your Account
              </a>
            </div>
            
            <h3>Next Steps:</h3>
            <ol>
              <li>Click the button above or visit the student portal</li>
              <li>Login using your email and temporary password</li>
              <li>You will be prompted to create a new password</li>
              <li>Complete your profile information</li>
            </ol>
            
            <p>If you have any questions or face any issues, please contact the hostel administration.</p>
            
            <p>Best regards,<br><strong>Hostel Management Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; ${new Date().getFullYear()} Hostel Management System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    return this.sendEmail({
      to: email,
      subject: '🎓 Your Hostel Management System Account Has Been Created',
      html
    });
  }

  async sendWelcomeEmail(student) {
    const html = `
      <h2>Welcome to Our Hostel!</h2>
      <p>Dear ${student.fullName},</p>
      <p>Your registration has been successful.</p>
      <p><strong>Student ID:</strong> ${student.studentId}</p>
      <p><strong>Room Number:</strong> ${student.room?.roomNumber || 'To be assigned'}</p>
      <p>Best regards,<br>Hostel Management Team</p>
    `;
    
    return this.sendEmail({
      to: student.email,
      subject: 'Welcome to Hostel',
      html
    });
  }

  async sendPaymentReceipt(payment, student) {
    const html = `
      <h2>Payment Receipt</h2>
      <p>Dear ${student.fullName},</p>
      <p>Your payment has been received successfully.</p>
      <table border="1" style="border-collapse: collapse; width: 100%;">
        <tr>
          <td><strong>Receipt Number:</strong></td>
          <td>${payment.receiptNumber}</td>
        </tr>
        <tr>
          <td><strong>Amount:</strong></td>
          <td>₹${payment.amount}</td>
        </tr>
        <tr>
          <td><strong>Payment Date:</strong></td>
          <td>${new Date(payment.paymentDate).toLocaleDateString()}</td>
        </tr>
        <tr>
          <td><strong>Payment Method:</strong></td>
          <td>${payment.paymentMethod}</td>
        </tr>
      </table>
      <p>Thank you for your payment.</p>
      <p>Best regards,<br>Hostel Management Team</p>
    `;
    
    return this.sendEmail({
      to: student.email,
      subject: 'Payment Receipt',
      html
    });
  }

  // Check if email service is configured
  isServiceConfigured() {
    return this.isConfigured;
  }
}

module.exports = new EmailService();