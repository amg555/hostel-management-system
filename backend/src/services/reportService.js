// backend/src/services/reportService.js
const { Student, Room, Payment, Complaint, Movement, Expense } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const moment = require('moment');

class ReportService {
  async generateMonthlyReport(month, year) {
    const startDate = moment(`${year}-${month}-01`).startOf('month');
    const endDate = moment(startDate).endOf('month');

    const [revenue, expenses, complaints, movements] = await Promise.all([
      this.getMonthlyRevenue(startDate, endDate),
      this.getMonthlyExpenses(startDate, endDate),
      this.getMonthlyComplaints(startDate, endDate),
      this.getMonthlyMovements(startDate, endDate)
    ]);

    return {
      period: `${month}/${year}`,
      revenue,
      expenses,
      netProfit: revenue.total - expenses.total,
      complaints,
      movements,
      generatedAt: new Date()
    };
  }

  async getMonthlyRevenue(startDate, endDate) {
    const payments = await Payment.findAll({
      where: {
        paymentDate: {
          [Op.between]: [startDate.toDate(), endDate.toDate()]
        },
        status: 'completed'
      },
      attributes: [
        'paymentType',
        [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['paymentType']
    });

    const total = await Payment.sum('amount', {
      where: {
        paymentDate: {
          [Op.between]: [startDate.toDate(), endDate.toDate()]
        },
        status: 'completed'
      }
    });

    return {
      total: total || 0,
      breakdown: payments
    };
  }

  async getMonthlyExpenses(startDate, endDate) {
    const expenses = await Expense.findAll({
      where: {
        date: {
          [Op.between]: [startDate.toDate(), endDate.toDate()]
        }
      },
      attributes: [
        'category',
        [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['category']
    });

    const total = await Expense.sum('amount', {
      where: {
        date: {
          [Op.between]: [startDate.toDate(), endDate.toDate()]
        }
      }
    });

    return {
      total: total || 0,
      breakdown: expenses
    };
  }

  async getMonthlyComplaints(startDate, endDate) {
    const complaints = await Complaint.findAll({
      where: {
        createdAt: {
          [Op.between]: [startDate.toDate(), endDate.toDate()]
        }
      },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    return complaints;
  }

  async getMonthlyMovements(startDate, endDate) {
    const movements = await Movement.count({
      where: {
        createdAt: {
          [Op.between]: [startDate.toDate(), endDate.toDate()]
        }
      }
    });

    return movements;
  }

  async getOccupancyTrend(months = 6) {
    const trend = [];
    const currentDate = moment();

    for (let i = months - 1; i >= 0; i--) {
      const date = moment(currentDate).subtract(i, 'months');
      const monthYear = date.format('MM-YYYY');
      
      // This is simplified - in production, you'd track historical occupancy
      const rooms = await Room.findAll({
        attributes: [
          [sequelize.fn('SUM', sequelize.col('capacity')), 'totalCapacity'],
          [sequelize.fn('SUM', sequelize.col('currentOccupancy')), 'totalOccupied']
        ]
      });

      const data = rooms[0].dataValues;
      trend.push({
        month: date.format('MMM YYYY'),
        occupancy: data.totalCapacity ? 
          Math.round((data.totalOccupied / data.totalCapacity) * 100) : 0
      });
    }

    return trend;
  }
}

module.exports = new ReportService();