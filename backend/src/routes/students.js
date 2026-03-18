// backend/src/routes/students.js
const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload'); // Make sure you have upload middleware

// Student routes (require authentication)
router.get('/profile', authenticate, studentController.getProfile);
router.put('/profile', authenticate, studentController.updateProfile);
router.post('/upload-profile-picture', 
  authenticate, 
  upload.single('profilePicture'), 
  studentController.uploadProfilePicture
);

// Admin routes
router.get('/', authenticate, authorize(['admin']), studentController.getAllStudents);
router.get('/:id', authenticate, authorize(['admin']), studentController.getStudentById);
router.post('/', authenticate, authorize(['admin']), studentController.createStudent);
router.put('/:id', authenticate, authorize(['admin']), studentController.updateStudent);
router.delete('/:id', authenticate, authorize(['admin']), studentController.deleteStudent);

// Send credentials route
router.post('/send-credentials', authenticate, authorize(['admin']), studentController.sendCredentials);

// Dashboard route for students
router.get('/dashboard', authenticate, studentController.getDashboard);

module.exports = router;