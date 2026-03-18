// src/routes/complaints.js
const router = require('express').Router();
const complaintController = require('../controllers/complaintController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', authenticate, complaintController.getAllComplaints.bind(complaintController));
router.get('/stats', authenticate, authorize(['admin']), complaintController.getComplaintStats.bind(complaintController));
router.get('/:id', authenticate, complaintController.getComplaintById.bind(complaintController));
router.post('/', authenticate, complaintController.createComplaint.bind(complaintController));
router.put('/:id', authenticate, authorize(['admin', 'staff']), complaintController.updateComplaint.bind(complaintController));
router.delete('/:id', authenticate, authorize(['admin']), complaintController.deleteComplaint.bind(complaintController));
router.post('/:id/feedback', authenticate, complaintController.addComplaintFeedback.bind(complaintController));

module.exports = router;