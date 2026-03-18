const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { User, Student, Room } = require('../models');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

class AuthController {
  // Generic login (keeping for backward compatibility)
  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      logger.info(`Login attempt for email: ${email}`);
      
      const user = await User.findOne({
        where: { email }
      });
      
      if (!user) {
        logger.warn(`User not found: ${email}`);
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        logger.warn(`Invalid password for user: ${email}`);
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      await user.update({ lastLogin: new Date() });
      
      let userData = user.toJSON();
      if (user.role === 'student') {
        const studentProfile = await Student.findOne({
          where: { userId: user.id }
        });
        if (studentProfile) {
          userData.studentProfile = studentProfile.toJSON();
        }
      }
      
      const token = this.generateToken(user);
      
      logger.info(`Successful login for user: ${email} with role: ${user.role}`);
      
      res.json({
        message: 'Login successful',
        token,
        user: userData
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  }

  // Student-specific login
  async studentLogin(req, res) {
    try {
      const { email, password } = req.body;
      
      logger.info(`Student login attempt for email: ${email}`);
      
      // First check if user exists at all
      const anyUser = await User.findOne({ where: { email } });
      
      if (!anyUser) {
        logger.warn(`No user found with email: ${email}`);
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Check if user is a student
      if (anyUser.role !== 'student') {
        logger.warn(`User ${email} is not a student. Role: ${anyUser.role}`);
        return res.status(401).json({ 
          message: 'This is student login. Please use admin login for admin accounts.' 
        });
      }
      
      const user = anyUser;
      
      logger.info(`Found student user: ${user.email}, checking password...`);
      
      const isValidPassword = await user.comparePassword(password);
      
      if (!isValidPassword) {
        logger.warn(`Invalid password for student: ${email}`);
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      if (!user.isActive) {
        logger.warn(`Inactive account for student: ${email}`);
        return res.status(403).json({ 
          message: 'Your account is inactive. Please contact admin.' 
        });
      }
      
      await user.update({ lastLogin: new Date() });
      
      // Create userData object first
      let userData = user.toJSON();
      
      // Get student profile with room details
      const studentProfile = await Student.findOne({
        where: { userId: user.id },
        include: [{
          model: Room,
          as: 'room',
          attributes: ['id', 'roomNumber', 'floor', 'type', 'monthlyRent']
        }]
      });
      
      if (!studentProfile) {
        logger.error(`No student profile found for user: ${user.id}`);
        // Create a basic student profile if missing
        const year = new Date().getFullYear();
        const count = await Student.count() + 1;
        const studentId = `STU${year}${count.toString().padStart(4, '0')}`;
        
        const newProfile = await Student.create({
          userId: user.id,
          studentId: studentId,
          fullName: email.split('@')[0], // Use email prefix as name
          email: email,
          phone: '0000000000',
          status: 'active'
        });
        
        userData.studentProfile = newProfile.toJSON();
      } else {
        userData.studentProfile = studentProfile.toJSON();
      }
      
      const token = this.generateToken(user);
      
      logger.info(`Successful student login for: ${email}`);
      
      res.json({
        message: 'Student login successful',
        token,
        user: userData
      });
    } catch (error) {
      logger.error('Student login error:', error);
      res.status(500).json({ message: 'Login failed. Please try again.' });
    }
  }

  // Admin-specific login
  async adminLogin(req, res) {
    try {
      const { email, password } = req.body;
      
      logger.info(`Admin login attempt for email: ${email}`);
      
      const user = await User.findOne({
        where: { email, role: 'admin' }
      });
      
      if (!user) {
        logger.warn(`No admin found with email: ${email}`);
        return res.status(401).json({ message: 'Invalid admin credentials' });
      }
      
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        logger.warn(`Invalid password for admin: ${email}`);
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      if (!user.isActive) {
        return res.status(403).json({ message: 'Account inactive' });
      }
      
      await user.update({ lastLogin: new Date() });
      
      const token = this.generateToken(user);
      
      logger.info(`Successful admin login for: ${email}`);
      
      res.json({
        message: 'Admin login successful',
        token,
        user: user.toJSON()
      });
    } catch (error) {
      logger.error('Admin login error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  }

  // Student registration (self-registration)
  async studentRegister(req, res) {
    try {
      const { email, password, studentData } = req.body;
      
      logger.info(`Student registration attempt for email: ${email}`);
      
      // Check if user exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
      }
      
      // Check if roll number exists
      if (studentData.rollNumber) {
        const existingStudent = await Student.findOne({ 
          where: { rollNumber: studentData.rollNumber } 
        });
        if (existingStudent) {
          return res.status(400).json({ message: 'Roll number already registered' });
        }
      }
      
      // Create user account
      const user = await User.create({
        email,
        password,
        role: 'student',
        isActive: false, // Require admin approval
        requirePasswordChange: false
      });
      
      // Generate student ID
      const year = new Date().getFullYear();
      const count = await Student.count() + 1;
      const studentId = `STU${year}${count.toString().padStart(4, '0')}`;
      
      // Create student profile
      const student = await Student.create({
        ...studentData,
        userId: user.id,
        studentId: studentId,
        email,
        status: 'pending', // Pending admin approval
        registrationDate: new Date()
      });
      
      logger.info(`Student registered successfully: ${email}`);
      
      res.status(201).json({
        message: 'Registration successful! Your account is pending admin approval.',
        requiresApproval: true
      });
    } catch (error) {
      logger.error('Student registration error:', error);
      res.status(500).json({ message: 'Registration failed' });
    }
  }

  // Generic register (backward compatibility)
  async register(req, res) {
    try {
      const { email, password, role, studentData } = req.body;
      
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
      }
      
      const user = await User.create({
        email,
        password,
        role: role || 'student',
        requirePasswordChange: false
      });
      
      if (role === 'student' && studentData) {
        // Generate student ID
        const year = new Date().getFullYear();
        const count = await Student.count() + 1;
        const studentId = `STU${year}${count.toString().padStart(4, '0')}`;
        
        await Student.create({
          ...studentData,
          userId: user.id,
          studentId,
          email
        });
      }
      
      const token = this.generateToken(user);
      
      res.status(201).json({
        message: 'Registration successful',
        token,
        user: user.toJSON()
      });
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({ message: 'Registration failed' });
    }
  }

  // Generate temporary password
  generateTemporaryPassword() {
    const length = 10;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }

  // Create student with auto-generated credentials (Admin function)
  async createStudentWithCredentials(req, res) {
    try {
      const studentData = req.body;
      
      logger.info(`Creating student account for: ${studentData.email}`);
      
      // Check if email already exists
      const existingUser = await User.findOne({ 
        where: { email: studentData.email } 
      });
      
      if (existingUser) {
        logger.warn(`Email already exists: ${studentData.email}`);
        return res.status(400).json({ 
          message: 'Email already registered' 
        });
      }

      // Check if roll number exists
      if (studentData.rollNumber) {
        const existingStudent = await Student.findOne({ 
          where: { rollNumber: studentData.rollNumber } 
        });
        if (existingStudent) {
          return res.status(400).json({ 
            message: 'Roll number already registered' 
          });
        }
      }

      // Generate temporary password
      const temporaryPassword = this.generateTemporaryPassword();
      
      logger.info(`Generated temporary password for ${studentData.email}`);
      
      // Create user account
      const user = await User.create({
        email: studentData.email,
        password: temporaryPassword,
        role: 'student',
        isActive: true,
        requirePasswordChange: true // Flag for first login
      });

      logger.info(`User account created for: ${studentData.email}`);

      // Generate student ID
      const year = new Date().getFullYear();
      const count = await Student.count() + 1;
      const studentId = `STU${year}${count.toString().padStart(4, '0')}`;

      // Create student profile
      const student = await Student.create({
        ...studentData,
        userId: user.id,
        studentId: studentId,
        status: 'active'
      });

      logger.info(`Student profile created: ${studentId}`);

      // Send credentials email if email service is configured
      if (studentData.sendEmail !== false && process.env.EMAIL_ENABLED === 'true') {
        try {
          await this.sendCredentialsEmail(
            studentData.email,
            studentId,
            temporaryPassword,
            studentData.fullName
          );
        } catch (emailError) {
          logger.error('Failed to send credentials email:', emailError);
          // Continue even if email fails
        }
      }

      res.status(201).json({
        message: 'Student account created successfully',
        credentials: {
          email: studentData.email,
          password: temporaryPassword,
          studentId: studentId,
          name: studentData.fullName
        },
        student: student.toJSON()
      });
    } catch (error) {
      logger.error('Create student error:', error);
      res.status(500).json({ 
        message: 'Failed to create student account' 
      });
    }
  }

  // Send credentials email
  async sendCredentialsEmail(email, studentId, password, name) {
    try {
      // Check if email service is available
      const emailService = require('../services/emailService');
      if (!emailService || !emailService.sendEmail) {
        logger.warn('Email service not configured');
        return;
      }

      const emailContent = `
        <h2>Welcome to Hostel Management System</h2>
        <p>Dear ${name},</p>
        <p>Your student account has been created successfully. Here are your login credentials:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Student ID:</strong> ${studentId}</p>
          <p><strong>Email (Username):</strong> ${email}</p>
          <p><strong>Temporary Password:</strong> ${password}</p>
        </div>
        <p style="color: #ff6b6b;"><strong>Important:</strong> You will be required to change this password on your first login.</p>
        <p>Login URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/student-login</p>
        <p>If you have any questions, please contact the hostel administration.</p>
        <p>Best regards,<br>Hostel Management Team</p>
      `;

      await emailService.sendEmail({
        to: email,
        subject: 'Your Hostel Management System Account Credentials',
        html: emailContent
      });
      
      logger.info(`Credentials email sent to: ${email}`);
    } catch (error) {
      logger.error('Error sending credentials email:', error);
      throw error;
    }
  }

  // Forgot password
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      
      logger.info(`Password reset requested for: ${email}`);
      
      const user = await User.findOne({ where: { email } });
      
      if (!user) {
        // Don't reveal if email exists or not for security
        return res.json({ 
          message: 'If the email exists, a reset link has been sent' 
        });
      }

      // Check if the model has resetToken fields
      if (!('resetToken' in user.dataValues)) {
        logger.error('Password reset fields not available in User model');
        return res.status(500).json({ 
          message: 'Password reset is not configured. Please contact admin.' 
        });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

      await user.update({
        resetToken,
        resetTokenExpiry
      });

      logger.info(`Reset token generated for: ${email}`);

      // Send reset email if email service is configured
      if (process.env.EMAIL_ENABLED === 'true') {
        try {
          await this.sendPasswordResetEmail(email, resetToken, user.role);
        } catch (emailError) {
          logger.error('Failed to send password reset email:', emailError);
        }
      }

      res.json({ 
        message: 'Password reset link sent to your email' 
      });
    } catch (error) {
      logger.error('Forgot password error:', error);
      res.status(500).json({ 
        message: 'Failed to process password reset request' 
      });
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(email, token, role) {
    try {
      // Check if email service is available
      const emailService = require('../services/emailService');
      if (!emailService || !emailService.sendEmail) {
        logger.warn('Email service not configured');
        return;
      }

      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
      
      const emailContent = `
        <h2>Password Reset Request</h2>
        <p>You have requested to reset your password. Click the link below to reset it:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
        <p>Or copy and paste this URL into your browser:</p>
        <p>${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>Hostel Management Team</p>
      `;

      await emailService.sendEmail({
        to: email,
        subject: 'Password Reset Request - Hostel Management System',
        html: emailContent
      });
      
      logger.info(`Password reset email sent to: ${email}`);
    } catch (error) {
      logger.error('Error sending password reset email:', error);
      throw error;
    }
  }

  // Verify reset token
  async verifyResetToken(req, res) {
    try {
      const { token } = req.body;
      
      const user = await User.findOne({
        where: {
          resetToken: token,
          resetTokenExpiry: {
            [Op.gt]: new Date()
          }
        }
      });

      if (!user) {
        return res.status(400).json({ 
          message: 'Invalid or expired reset token' 
        });
      }

      res.json({ 
        message: 'Token is valid',
        email: user.email 
      });
    } catch (error) {
      logger.error('Verify token error:', error);
      res.status(500).json({ 
        message: 'Failed to verify token' 
      });
    }
  }

  // Reset password with token
  async resetPassword(req, res) {
    try {
      const { token, password } = req.body;
      
      const user = await User.findOne({
        where: {
          resetToken: token,
          resetTokenExpiry: {
            [Op.gt]: new Date()
          }
        }
      });

      if (!user) {
        return res.status(400).json({ 
          message: 'Invalid or expired reset token' 
        });
      }

      logger.info(`Resetting password for user: ${user.email}`);

      // Update password and clear reset token
      user.password = password;
      user.resetToken = null;
      user.resetTokenExpiry = null;
      if ('requirePasswordChange' in user.dataValues) {
        user.requirePasswordChange = false;
      }
      await user.save();

      logger.info(`Password reset successful for: ${user.email}`);

      res.json({ 
        message: 'Password reset successfully' 
      });
    } catch (error) {
      logger.error('Reset password error:', error);
      res.status(500).json({ 
        message: 'Failed to reset password' 
      });
    }
  }

  // Get current user
  async me(req, res) {
    try {
      const user = await User.findByPk(req.user.id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      let userData = user.toJSON();
      
      if (user.role === 'student') {
        const studentProfile = await Student.findOne({
          where: { userId: user.id },
          include: [{
            model: Room,
            as: 'room',
            attributes: ['id', 'roomNumber', 'floor', 'type', 'monthlyRent']
          }]
        });
        if (studentProfile) {
          userData.studentProfile = studentProfile.toJSON();
        }
      }
      
      res.json(userData);
    } catch (error) {
      logger.error('Get user error:', error);
      res.status(500).json({ message: 'Failed to get user data' });
    }
  }
  
  // Change password
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findByPk(req.user.id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const isValid = await user.comparePassword(currentPassword);
      if (!isValid) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      
      logger.info(`Changing password for user: ${user.email}`);
      
      user.password = newPassword;
      // Update requirePasswordChange if it exists
      if ('requirePasswordChange' in user.dataValues) {
        user.requirePasswordChange = false;
      }
      await user.save();
      
      logger.info(`Password changed successfully for: ${user.email}`);
      
      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      logger.error('Change password error:', error);
      res.status(500).json({ message: 'Failed to change password' });
    }
  }

  // Send credentials to student email (Manual trigger)
  async sendStudentCredentials(req, res) {
    try {
      const { email, studentId, password, name } = req.body;
      
      if (process.env.EMAIL_ENABLED !== 'true') {
        return res.status(400).json({ 
          message: 'Email service is not configured' 
        });
      }
      
      await this.sendCredentialsEmail(email, studentId, password, name);
      
      res.json({ 
        message: 'Credentials sent successfully' 
      });
    } catch (error) {
      logger.error('Send credentials error:', error);
      res.status(500).json({ 
        message: 'Failed to send credentials' 
      });
    }
  }
  
  // Generate JWT token
  generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
  }

  // Debug method to check user credentials
  async debugCheckUser(req, res) {
    try {
      const { email } = req.body;
      
      const user = await User.findOne({ where: { email } });
      
      if (!user) {
        return res.json({ 
          exists: false,
          message: 'User not found' 
        });
      }
      
      const student = await Student.findOne({ where: { userId: user.id } });
      
      res.json({
        exists: true,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        requirePasswordChange: user.requirePasswordChange,
        hasStudentProfile: !!student,
        studentId: student?.studentId,
        studentName: student?.fullName
      });
    } catch (error) {
      logger.error('Debug check error:', error);
      res.status(500).json({ message: 'Debug check failed' });
    }
  }
}

module.exports = new AuthController();