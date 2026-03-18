// src/routes/reports.js
const router = require('express').Router();
const reportController = require('../controllers/reportController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/financial', authenticate, authorize(['admin']), reportController.getFinancialReport.bind(reportController));
router.get('/occupancy', authenticate, authorize(['admin']), reportController.getOccupancyReport.bind(reportController));
router.get('/students', authenticate, authorize(['admin']), reportController.getStudentReport.bind(reportController));
router.get('/complaints', authenticate, authorize(['admin']), reportController.getComplaintReport.bind(reportController));
router.get('/dashboard-stats', authenticate, authorize(['admin']), reportController.getDashboardStats.bind(reportController));

module.exports = router;