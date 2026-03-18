// src/routes/notices.js
const router = require('express').Router();
const noticeController = require('../controllers/noticeController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', authenticate, noticeController.getAllNotices.bind(noticeController));
router.get('/:id', authenticate, noticeController.getNoticeById.bind(noticeController));
router.post('/', authenticate, authorize(['admin']), noticeController.createNotice.bind(noticeController));
router.put('/:id', authenticate, authorize(['admin']), noticeController.updateNotice.bind(noticeController));
router.delete('/:id', authenticate, authorize(['admin']), noticeController.deleteNotice.bind(noticeController));
router.patch('/:id/toggle', authenticate, authorize(['admin']), noticeController.toggleNoticeStatus.bind(noticeController));

module.exports = router;