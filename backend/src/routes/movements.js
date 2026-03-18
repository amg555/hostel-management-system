// backend/src/routes/movements.js
const express = require('express');
const router = express.Router();
const movementController = require('../controllers/movementController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Student routes - these must come first to avoid route conflicts
router.get('/status', movementController.getMovementStatus);
router.get('/my-movements', movementController.getMyMovements);
router.post('/', movementController.createMovement);

// Admin/Staff routes
router.get('/stats', authorize(['admin', 'staff']), movementController.getMovementStats);
router.get('/students-at-home', authorize(['admin', 'staff']), movementController.getStudentsAtHome);
router.get('/students-by-location', authorize(['admin', 'staff']), movementController.getStudentsByLocation);
router.get('/report', authorize(['admin', 'staff']), movementController.getMovementReport);
router.get('/', authorize(['admin', 'staff']), movementController.getAllMovements);
router.put('/:id', authorize(['admin', 'staff']), movementController.updateMovement);
router.put('/:id/approve', authorize(['admin', 'staff']), movementController.approveMovement);
router.delete('/:id', authorize(['admin']), movementController.deleteMovement);

module.exports = router;