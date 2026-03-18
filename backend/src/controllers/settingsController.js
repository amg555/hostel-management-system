// backend/src/controllers/settingsController.js
const { Setting, User } = require('../models');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');

class SettingsController {
  async getSettings(req, res) {
    try {
      const { group } = req.query;
      const where = group ? { group } : {};
      
      const settings = await Setting.findAll({ where });
      
      // Convert to key-value object
      const settingsObj = {};
      settings.forEach(s => {
        let value = s.value;
        if (s.type === 'number') value = Number(value);
        if (s.type === 'boolean') value = value === 'true';
        if (s.type === 'json') value = JSON.parse(value);
        settingsObj[s.key] = value;
      });
      
      res.json(settingsObj);
    } catch (error) {
      logger.error('Get settings error:', error);
      res.status(500).json({ message: 'Failed to fetch settings' });
    }
  }

  async updateSettings(req, res) {
    try {
      const settingsData = req.body;
      const { group = 'general' } = req.query;
      
      // Update each setting
      for (const [key, value] of Object.entries(settingsData)) {
        let stringValue = String(value);
        let type = typeof value;
        
        if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
          stringValue = JSON.stringify(value);
          type = 'json';
        }

        await Setting.upsert({
          key,
          value: stringValue,
          group,
          type
        });
      }
      
      res.json({ message: 'Settings updated successfully' });
    } catch (error) {
      logger.error('Update settings error:', error);
      res.status(500).json({ message: 'Failed to update settings' });
    }
  }

  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;
      
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid current password' });
      }
      
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await user.update({ password: hashedPassword });
      
      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      logger.error('Change password error:', error);
      res.status(500).json({ message: 'Failed to change password' });
    }
  }

  async updateProfile(req, res) {
    try {
      const { name, email, phoneNumber } = req.body;
      const userId = req.user.id;
      
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      await user.update({ name, email, phoneNumber });
      
      res.json({ 
        message: 'Profile updated successfully',
        user: user.toJSON()
      });
    } catch (error) {
      logger.error('Update profile error:', error);
      res.status(500).json({ message: 'Failed to update profile' });
    }
  }
}

module.exports = new SettingsController();
