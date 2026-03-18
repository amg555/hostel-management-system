// backend/src/routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validateLogin, validateRegister } = require('../middleware/validation');

// Public routes
router.post('/login', validateLogin, authController.login.bind(authController));
router.post('/student-login', validateLogin, authController.studentLogin.bind(authController));
router.post('/admin-login', validateLogin, authController.adminLogin.bind(authController));

// Removed student-register route - students can only be created by admin

// Protected routes
router.get('/me', authenticate, authController.me.bind(authController));
router.post('/change-password', authenticate, authController.changePassword.bind(authController));

// Password management routes
router.post('/forgot-password', authController.forgotPassword.bind(authController));
router.post('/reset-password', authController.resetPassword.bind(authController));
router.post('/verify-reset-token', authController.verifyResetToken.bind(authController));

// Admin route to create student with credentials
router.post('/admin/create-student', authenticate, authController.createStudentWithCredentials.bind(authController));

// Debug routes (remove in production)
if (process.env.NODE_ENV !== 'production') {
  router.post('/debug/check-user', authController.debugCheckUser.bind(authController));
  
  // Test route to verify auth is working
  router.post('/debug/test-login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const { User } = require('../models');
      const bcrypt = require('bcryptjs');
      
      const user = await User.findOne({ where: { email } });
      
      if (!user) {
        return res.json({ 
          success: false, 
          message: 'User not found',
          email: email 
        });
      }
      
      const isValid = await bcrypt.compare(password, user.password);
      const instanceValid = await user.comparePassword(password);
      
      res.json({
        success: isValid && instanceValid,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        directCompare: isValid,
        instanceCompare: instanceValid,
        passwordHashStart: user.password.substring(0, 10)
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  });
}

module.exports = router;