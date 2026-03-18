const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// Student routes
router.get('/status', paymentController.getPaymentStatus);
router.get('/my-payments', paymentController.getMyPayments);

// Admin/Staff routes
router.get('/', authorize(['admin', 'staff']), paymentController.getAllPayments);
router.post('/record', authorize(['admin', 'staff']), paymentController.recordOfflinePayment);
router.get('/pending', authorize(['admin', 'staff']), paymentController.getPendingPayments);

// Routes with :id parameter
router.get('/:id', authorize(['admin', 'staff']), paymentController.getPaymentById);
router.put('/:id', authorize(['admin', 'staff']), paymentController.updatePayment);
router.get('/:id/receipt', paymentController.generateReceipt);

module.exports = router;