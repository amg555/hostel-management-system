// backend/src/routes/settings.js
const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, settingsController.getSettings);
router.put('/', authenticate, authorize(['admin']), settingsController.updateSettings);
router.put('/profile', authenticate, settingsController.updateProfile);
router.post('/change-password', authenticate, settingsController.changePassword);

module.exports = router;
