// src/controllers/complaintController.js
const { Complaint, Student, User } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const notificationService = require('../services/notificationService');

class ComplaintController {
  async getAllComplaints(req, res) {
    try {
      const { page = 1, limit = 10, status, category, priority, studentId } = req.query;
      
      const where = {};
      if (status) where.status = status;
      if (category) where.category = category;
      if (priority) where.priority = priority;
      if (studentId) where.studentId = studentId;
      
      // For students, only show their complaints
      if (req.user.role === 'student') {
        const student = await Student.findOne({ where: { userId: req.user.id } });
        where.studentId = student.id;
      }
      
      const complaints = await Complaint.findAndCountAll({
        where,
        include: [{
          model: Student,
          as: 'student',
          attributes: ['id', 'fullName', 'studentId', 'roomId']
        }],
        limit: parseInt(limit),
        offset: (page - 1) * limit,
        order: [['createdAt', 'DESC']]
      });
      
      res.json({
        complaints: complaints.rows,
        total: complaints.count,
        currentPage: parseInt(page),
        totalPages: Math.ceil(complaints.count / limit)
      });
    } catch (error) {
      logger.error('Get complaints error:', error);
      res.status(500).json({ message: 'Failed to fetch complaints' });
    }
  }
  
  async getComplaintById(req, res) {
    try {
      const complaint = await Complaint.findByPk(req.params.id, {
        include: [{
          model: Student,
          as: 'student',
          include: ['room']
        }]
      });
      
      if (!complaint) {
        return res.status(404).json({ message: 'Complaint not found' });
      }
      
      // Check access for students
      if (req.user.role === 'student') {
        const student = await Student.findOne({ where: { userId: req.user.id } });
        if (complaint.studentId !== student.id) {
          return res.status(403).json({ message: 'Access denied' });
        }
      }
      
      res.json(complaint);
    } catch (error) {
      logger.error('Get complaint error:', error);
      res.status(500).json({ message: 'Failed to fetch complaint' });
    }
  }
  
  async createComplaint(req, res) {
    try {
      const complaintData = req.body;
      
      // Get student ID for logged in student
      if (req.user.role === 'student') {
        const student = await Student.findOne({ where: { userId: req.user.id } });
        complaintData.studentId = student.id;
      }
      
      // Generate complaint number
      const date = new Date();
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      
      const lastComplaint = await Complaint.findOne({
        where: {
          complaintNumber: {
            [Op.like]: `CMP${year}${month}%`
          }
        },
        order: [['createdAt', 'DESC']]
      });
      
      const sequence = lastComplaint 
        ? parseInt(lastComplaint.complaintNumber.slice(-4)) + 1 
        : 1;
      
      complaintData.complaintNumber = `CMP${year}${month}${sequence.toString().padStart(4, '0')}`;
      
      const complaint = await Complaint.create(complaintData);
      
      // Notify admin
      await notificationService.notifyAdmins('New Complaint', 
        `New ${complaint.priority} priority complaint: ${complaint.subject}`
      );
      
      res.status(201).json({
        message: 'Complaint registered successfully',
        complaint
      });
    } catch (error) {
      logger.error('Create complaint error:', error);
      res.status(500).json({ message: 'Failed to create complaint' });
    }
  }
  
  async updateComplaint(req, res) {
    try {
      const complaint = await Complaint.findByPk(req.params.id);
      
      if (!complaint) {
        return res.status(404).json({ message: 'Complaint not found' });
      }
      
      const oldStatus = complaint.status;
      await complaint.update(req.body);
      
      // If status changed to resolved, update resolved timestamp
      if (oldStatus !== 'resolved' && req.body.status === 'resolved') {
        complaint.resolvedAt = new Date();
        complaint.resolvedBy = req.user.email;
        await complaint.save();
        
        // Notify student
        const student = await Student.findByPk(complaint.studentId, {
          include: ['user']
        });
        
        if (student && student.user) {
          await notificationService.sendNotification(
            student.user.email,
            'Complaint Resolved',
            `Your complaint #${complaint.complaintNumber} has been resolved.`
          );
        }
      }
      
      res.json({
        message: 'Complaint updated successfully',
        complaint
      });
    } catch (error) {
      logger.error('Update complaint error:', error);
      res.status(500).json({ message: 'Failed to update complaint' });
    }
  }
  
  async deleteComplaint(req, res) {
    try {
      const complaint = await Complaint.findByPk(req.params.id);
      
      if (!complaint) {
        return res.status(404).json({ message: 'Complaint not found' });
      }
      
      await complaint.destroy();
      
      res.json({ message: 'Complaint deleted successfully' });
    } catch (error) {
      logger.error('Delete complaint error:', error);
      res.status(500).json({ message: 'Failed to delete complaint' });
    }
  }
  
  async addComplaintFeedback(req, res) {
    try {
      const { feedback, rating } = req.body;
      const complaint = await Complaint.findByPk(req.params.id);
      
      if (!complaint) {
        return res.status(404).json({ message: 'Complaint not found' });
      }
      
      // Check if complaint is resolved
      if (complaint.status !== 'resolved') {
        return res.status(400).json({ 
          message: 'Can only add feedback to resolved complaints' 
        });
      }
      
      await complaint.update({ feedback, rating });
      
      res.json({
        message: 'Feedback added successfully',
        complaint
      });
    } catch (error) {
      logger.error('Add feedback error:', error);
      res.status(500).json({ message: 'Failed to add feedback' });
    }
  }
  
  async getComplaintStats(req, res) {
    try {
      const stats = await Complaint.findAll({
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['status']
      });
      
      const categoryStats = await Complaint.findAll({
        attributes: [
          'category',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['category']
      });
      
      res.json({
        statusStats: stats,
        categoryStats: categoryStats
      });
    } catch (error) {
      logger.error('Get complaint stats error:', error);
      res.status(500).json({ message: 'Failed to fetch complaint stats' });
    }
  }
}

module.exports = new ComplaintController();