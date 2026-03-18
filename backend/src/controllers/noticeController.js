const { Notice, User } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class NoticeController {
  async getAllNotices(req, res) {
    try {
      const { page = 1, limit = 10, category, priority, active } = req.query;
      
      const where = {};
      if (category) where.category = category;
      if (priority) where.priority = priority;
      if (active !== undefined) where.isActive = active === 'true';
      
      // For students, only show active notices
      if (req.user && req.user.role === 'student') {
        where.isActive = true;
        const now = new Date();
        where[Op.and] = [
          {
            [Op.or]: [
              { validFrom: null },
              { validFrom: { [Op.lte]: now } }
            ]
          },
          {
            [Op.or]: [
              { validUntil: null },
              { validUntil: { [Op.gte]: now } }
            ]
          }
        ];
      }
      
      const notices = await Notice.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
        order: [
          ['createdAt', 'DESC']
        ]
      });
      
      res.json({
        notices: notices.rows,
        total: notices.count,
        currentPage: parseInt(page),
        totalPages: Math.ceil(notices.count / parseInt(limit))
      });
    } catch (error) {
      logger.error('Get notices error:', error);
      res.status(500).json({ message: 'Failed to fetch notices' });
    }
  }
  
  async getNoticeById(req, res) {
    try {
      const notice = await Notice.findByPk(req.params.id, {
        include: [{
          model: User,
          as: 'publisher',
          attributes: ['id', 'email', 'role']
        }]
      });
      
      if (!notice) {
        return res.status(404).json({ message: 'Notice not found' });
      }
      
      // Increment view count if it exists
      if (notice.viewCount !== undefined) {
        await notice.increment('viewCount');
      }
      
      res.json(notice);
    } catch (error) {
      logger.error('Get notice error:', error);
      res.status(500).json({ message: 'Failed to fetch notice' });
    }
  }
  
  async createNotice(req, res) {
    try {
      const noticeData = {
        ...req.body,
        publishedBy: req.user.id,
        createdBy: req.user.email
      };
      
      const notice = await Notice.create(noticeData);
      
      res.status(201).json({
        message: 'Notice created successfully',
        notice
      });
    } catch (error) {
      logger.error('Create notice error:', error);
      res.status(500).json({ message: 'Failed to create notice' });
    }
  }
  
  async updateNotice(req, res) {
    try {
      const notice = await Notice.findByPk(req.params.id);
      
      if (!notice) {
        return res.status(404).json({ message: 'Notice not found' });
      }
      
      await notice.update(req.body);
      
      res.json({
        message: 'Notice updated successfully',
        notice
      });
    } catch (error) {
      logger.error('Update notice error:', error);
      res.status(500).json({ message: 'Failed to update notice' });
    }
  }
  
  async deleteNotice(req, res) {
    try {
      const notice = await Notice.findByPk(req.params.id);
      
      if (!notice) {
        return res.status(404).json({ message: 'Notice not found' });
      }
      
      await notice.destroy();
      
      res.json({ message: 'Notice deleted successfully' });
    } catch (error) {
      logger.error('Delete notice error:', error);
      res.status(500).json({ message: 'Failed to delete notice' });
    }
  }
  
  async toggleNoticeStatus(req, res) {
    try {
      const notice = await Notice.findByPk(req.params.id);
      
      if (!notice) {
        return res.status(404).json({ message: 'Notice not found' });
      }
      
      notice.isActive = !notice.isActive;
      await notice.save();
      
      res.json({
        message: `Notice ${notice.isActive ? 'activated' : 'deactivated'} successfully`,
        notice
      });
    } catch (error) {
      logger.error('Toggle notice status error:', error);
      res.status(500).json({ message: 'Failed to toggle notice status' });
    }
  }
}

module.exports = new NoticeController();