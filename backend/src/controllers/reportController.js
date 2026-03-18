// src/controllers/reportController.js
const { Student, Room, Payment, Complaint, Movement, Expense } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const logger = require('../utils/logger');
const moment = require('moment');
const pdfService = require('../services/pdfService');

class ReportController {
  async getFinancialReport(req, res) {
    try {
      const { startDate, endDate, format } = req.query;
      
      const dateFilter = {
        [Op.between]: [
          moment(startDate).startOf('day').toDate(),
          moment(endDate).endOf('day').toDate()
        ]
      };
      
      // Revenue
      const revenue = await Payment.sum('amount', {
        where: {
          paymentDate: dateFilter,
          status: 'completed'
        }
      });
      
      // Expenses
      const expenses = await Expense.sum('amount', {
        where: {
          date: dateFilter,
          status: 'paid'
        }
      });
      
      // Payment breakdown
      const paymentBreakdown = await Payment.findAll({
        where: {
          paymentDate: dateFilter,
          status: 'completed'
        },
        attributes: [
          'paymentType',
          [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['paymentType']
      });
      
      // Expense breakdown
      const expenseBreakdown = await Expense.findAll({
        where: {
          date: dateFilter,
          status: 'paid'
        },
        attributes: [
          'category',
          [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['category']
      });
      
      // Calculate profit
      const profit = (revenue || 0) - (expenses || 0);
      
      const reportData = {
        summary: {
          revenue: revenue || 0,
          expenses: expenses || 0,
          profit,
          profitMargin: revenue ? ((profit / revenue) * 100).toFixed(2) : 0
        },
        paymentBreakdown,
        expenseBreakdown,
        period: {
          from: startDate,
          to: endDate
        }
      };

      // Generate PDF if requested
      if (format === 'pdf') {
        const pdf = await pdfService.generateFinancialReportPDF(reportData);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="financial-report-${moment().format('YYYY-MM-DD')}.pdf"`);
        return res.send(pdf);
      }

      res.json(reportData);
    } catch (error) {
      logger.error('Get financial report error:', error);
      res.status(500).json({ message: 'Failed to generate financial report' });
    }
  }
  
  async getOccupancyReport(req, res) {
    try {
      const { format } = req.query;

      // Get room statistics
      const roomStats = await Room.findAll({
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'totalRooms'],
          [sequelize.fn('SUM', sequelize.col('capacity')), 'totalCapacity'],
          [sequelize.fn('SUM', sequelize.col('currentOccupancy')), 'totalOccupied']
        ]
      });
      
      // Get floor-wise occupancy
      const floorOccupancy = await Room.findAll({
        attributes: [
          'floor',
          [sequelize.fn('COUNT', sequelize.col('id')), 'rooms'],
          [sequelize.fn('SUM', sequelize.col('capacity')), 'capacity'],
          [sequelize.fn('SUM', sequelize.col('currentOccupancy')), 'occupied']
        ],
        group: ['floor'],
        order: [['floor', 'ASC']]
      });
      
      // Get room type occupancy
      const typeOccupancy = await Room.findAll({
        attributes: [
          'type',
          [sequelize.fn('COUNT', sequelize.col('id')), 'rooms'],
          [sequelize.fn('SUM', sequelize.col('capacity')), 'capacity'],
          [sequelize.fn('SUM', sequelize.col('currentOccupancy')), 'occupied']
        ],
        group: ['type']
      });
      
      const stats = roomStats[0].dataValues;
      const occupancyRate = stats.totalCapacity 
        ? ((stats.totalOccupied / stats.totalCapacity) * 100).toFixed(2)
        : 0;
      
      const reportData = {
        summary: {
          totalRooms: stats.totalRooms,
          totalCapacity: stats.totalCapacity,
          totalOccupied: stats.totalOccupied,
          availableBeds: stats.totalCapacity - stats.totalOccupied,
          occupancyRate: `${occupancyRate}%`
        },
        floorWise: floorOccupancy.map(floor => ({
          ...floor.dataValues,
          occupancyRate: floor.dataValues.capacity 
            ? ((floor.dataValues.occupied / floor.dataValues.capacity) * 100).toFixed(2)
            : 0
        })),
        typeWise: typeOccupancy.map(type => ({
          ...type.dataValues,
          occupancyRate: type.dataValues.capacity
            ? ((type.dataValues.occupied / type.dataValues.capacity) * 100).toFixed(2)
            : 0
        }))
      };

      // Generate PDF if requested
      if (format === 'pdf') {
        const pdf = await pdfService.generateOccupancyReportPDF(reportData);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="occupancy-report-${moment().format('YYYY-MM-DD')}.pdf"`);
        return res.send(pdf);
      }

      res.json(reportData);
    } catch (error) {
      logger.error('Get occupancy report error:', error);
      res.status(500).json({ message: 'Failed to generate occupancy report' });
    }
  }
  
  async getStudentReport(req, res) {
    try {
      const { status, roomId, admissionDateFrom, admissionDateTo, format } = req.query;
      
      const where = {};
      if (status) where.status = status;
      if (roomId) where.roomId = roomId;
      if (admissionDateFrom && admissionDateTo) {
        where.admissionDate = {
          [Op.between]: [admissionDateFrom, admissionDateTo]
        };
      }
      
      // Get student statistics
      const totalStudents = await Student.count({ where });
      const activeStudents = await Student.count({ 
        where: { ...where, status: 'active' } 
      });
      const inactiveStudents = await Student.count({ 
        where: { ...where, status: 'inactive' } 
      });
      
      // Get course-wise distribution
      const courseDistribution = await Student.findAll({
        where,
        attributes: [
          'course',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['course']
      });
      
      // Get academic year distribution
      const yearDistribution = await Student.findAll({
        where,
        attributes: [
          'academicYear',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['academicYear']
      });
      
      // Get recent admissions
      const recentAdmissions = await Student.findAll({
        where: {
          ...where,
          admissionDate: {
            [Op.gte]: moment().subtract(30, 'days').toDate()
          }
        },
        limit: 10,
        order: [['admissionDate', 'DESC']],
        include: ['room']
      });
      
      const reportData = {
        summary: {
          total: totalStudents,
          active: activeStudents,
          inactive: inactiveStudents,
          occupancyRate: totalStudents ? 
            ((activeStudents / totalStudents) * 100).toFixed(2) : 0
        },
        courseDistribution,
        yearDistribution,
        recentAdmissions
      };

      // Generate PDF if requested
      if (format === 'pdf') {
        const pdf = await pdfService.generateStudentReportPDF(reportData);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="student-report-${moment().format('YYYY-MM-DD')}.pdf"`);
        return res.send(pdf);
      }

      res.json(reportData);
    } catch (error) {
      logger.error('Get student report error:', error);
      res.status(500).json({ message: 'Failed to generate student report' });
    }
  }
  
  async getComplaintReport(req, res) {
    try {
      const { startDate, endDate, format } = req.query;
      
      const where = {};
      if (startDate && endDate) {
        where.createdAt = {
          [Op.between]: [
            moment(startDate).startOf('day').toDate(),
            moment(endDate).endOf('day').toDate()
          ]
        };
      }
      
      // Status distribution
      const statusDistribution = await Complaint.findAll({
        where,
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['status']
      });
      
      // Category distribution
      const categoryDistribution = await Complaint.findAll({
        where,
        attributes: [
          'category',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['category']
      });
      
      // Priority distribution
      const priorityDistribution = await Complaint.findAll({
        where,
        attributes: [
          'priority',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['priority']
      });
      
      // Calculate resolution time
      const resolvedComplaints = await Complaint.findAll({
        where: {
          ...where,
          status: 'resolved',
          resolvedAt: { [Op.ne]: null }
        }
      });
      
      const avgResolutionTime = resolvedComplaints.length > 0
        ? resolvedComplaints.reduce((acc, complaint) => {
            const created = new Date(complaint.createdAt);
            const resolved = new Date(complaint.resolvedAt);
            const hours = (resolved - created) / (1000 * 60 * 60);
            return acc + hours;
          }, 0) / resolvedComplaints.length
        : 0;
      
      const reportData = {
        summary: {
          total: statusDistribution.reduce((acc, s) => acc + parseInt(s.dataValues.count), 0),
          resolved: statusDistribution.find(s => s.status === 'resolved')?.dataValues.count || 0,
          pending: statusDistribution.find(s => s.status === 'open')?.dataValues.count || 0,
          avgResolutionTime: `${avgResolutionTime.toFixed(1)} hours`
        },
        statusDistribution,
        categoryDistribution,
        priorityDistribution,
        period: {
          from: startDate,
          to: endDate
        }
      };

      // Generate PDF if requested
      if (format === 'pdf') {
        const pdf = await pdfService.generateComplaintReportPDF(reportData);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="complaint-report-${moment().format('YYYY-MM-DD')}.pdf"`);
        return res.send(pdf);
      }

      res.json(reportData);
    } catch (error) {
      logger.error('Get complaint report error:', error);
      res.status(500).json({ message: 'Failed to generate complaint report' });
    }
  }
  
  async getDashboardStats(req, res) {
    try {
      // For admin dashboard
      const [
        totalStudents,
        activeStudents,
        totalRooms,
        occupiedRooms,
        monthlyRevenue,
        pendingPayments,
        openComplaints,
        todayMovements
      ] = await Promise.all([
        Student.count(),
        Student.count({ where: { status: 'active' } }),
        Room.count(),
        Room.count({ where: { currentOccupancy: { [Op.gt]: 0 } } }),
        Payment.sum('amount', {
          where: {
            paymentDate: {
              [Op.gte]: moment().startOf('month').toDate()
            },
            status: 'completed'
          }
        }),
        Payment.count({
          where: {
            status: 'pending'
          }
        }),
        Complaint.count({
          where: {
            status: ['open', 'in_progress']
          }
        }),
        Movement.count({
          where: {
            createdAt: {
              [Op.gte]: moment().startOf('day').toDate()
            }
          }
        })
      ]);
      
      // Get recent activities
      const recentActivities = await Promise.all([
        Payment.findAll({
          limit: 5,
          order: [['createdAt', 'DESC']],
          include: ['student']
        }),
        Complaint.findAll({
          limit: 5,
          order: [['createdAt', 'DESC']],
          include: ['student']
        }),
        Movement.findAll({
          limit: 5,
          order: [['createdAt', 'DESC']],
          include: ['student']
        })
      ]);
      
      res.json({
        stats: {
          totalStudents,
          activeStudents,
          totalRooms,
          occupiedRooms,
          monthlyRevenue: monthlyRevenue || 0,
          pendingPayments,
          openComplaints,
          todayMovements,
          occupancyRate: totalRooms 
            ? ((occupiedRooms / totalRooms) * 100).toFixed(2)
            : 0
        },
        recentActivities: {
          payments: recentActivities[0],
          complaints: recentActivities[1],
          movements: recentActivities[2]
        }
      });
    } catch (error) {
      logger.error('Get dashboard stats error:', error);
      res.status(500).json({ message: 'Failed to fetch dashboard stats' });
    } finally {
      // Close browser when server shuts down
      process.on('SIGINT', async () => {
        await pdfService.closeBrowser();
        process.exit();
      });
    }
  }
}

module.exports = new ReportController();