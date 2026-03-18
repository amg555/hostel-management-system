const router = require('express').Router();

// Import all route modules
const authRoutes = require('./auth');
const studentRoutes = require('./students');
const roomRoutes = require('./rooms');
const paymentRoutes = require('./payments');
const complaintRoutes = require('./complaints');
const noticeRoutes = require('./notices');
const movementRoutes = require('./movements');
const expenseRoutes = require('./expenses');
const reportRoutes = require('./reports');
const settingsRoutes = require('./settings');
const reportController = require('../controllers/reportController');
const { authenticate, authorize } = require('../middleware/auth');

// Mount routes
router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/rooms', roomRoutes);
router.use('/payments', paymentRoutes);
router.use('/complaints', complaintRoutes);
router.use('/notices', noticeRoutes);
router.use('/movements', movementRoutes);
router.use('/expenses', expenseRoutes);
router.use('/reports', reportRoutes);
router.use('/settings', settingsRoutes);

// Admin dashboard stats
router.get('/admin/dashboard/stats', authenticate, authorize(['admin']), reportController.getDashboardStats);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

module.exports = router;