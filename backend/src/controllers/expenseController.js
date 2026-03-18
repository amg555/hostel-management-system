// src/controllers/expenseController.js
const { Expense } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const moment = require('moment');

class ExpenseController {
  async getAllExpenses(req, res) {
    try {
      const { page = 1, limit = 10, category, startDate, endDate, status } = req.query;
      
      const where = {};
      if (category) where.category = category;
      if (status) where.status = status;
      
      if (startDate && endDate) {
        where.date = {
          [Op.between]: [startDate, endDate]
        };
      }
      
      const expenses = await Expense.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: (page - 1) * limit,
        order: [['date', 'DESC']]
      });
      
      // Calculate total
      const total = await Expense.sum('amount', { where });
      
      res.json({
        expenses: expenses.rows,
        total: expenses.count,
        totalAmount: total || 0,
        currentPage: parseInt(page),
        totalPages: Math.ceil(expenses.count / limit)
      });
    } catch (error) {
      logger.error('Get expenses error:', error);
      res.status(500).json({ message: 'Failed to fetch expenses' });
    }
  }
  
  async getExpenseById(req, res) {
    try {
      const expense = await Expense.findByPk(req.params.id);
      
      if (!expense) {
        return res.status(404).json({ message: 'Expense not found' });
      }
      
      res.json(expense);
    } catch (error) {
      logger.error('Get expense error:', error);
      res.status(500).json({ message: 'Failed to fetch expense' });
    }
  }
  
  async createExpense(req, res) {
    try {
      const expenseData = {
        ...req.body,
        approvedBy: req.user.email
      };
      
      const expense = await Expense.create(expenseData);
      
      res.status(201).json({
        message: 'Expense recorded successfully',
        expense
      });
    } catch (error) {
      logger.error('Create expense error:', error);
      res.status(500).json({ message: 'Failed to create expense' });
    }
  }
  
  async updateExpense(req, res) {
    try {
      const expense = await Expense.findByPk(req.params.id);
      
      if (!expense) {
        return res.status(404).json({ message: 'Expense not found' });
      }
      
      await expense.update(req.body);
      
      res.json({
        message: 'Expense updated successfully',
        expense
      });
    } catch (error) {
      logger.error('Update expense error:', error);
      res.status(500).json({ message: 'Failed to update expense' });
    }
  }
  
  async deleteExpense(req, res) {
    try {
      const expense = await Expense.findByPk(req.params.id);
      
      if (!expense) {
        return res.status(404).json({ message: 'Expense not found' });
      }
      
      await expense.destroy();
      
      res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
      logger.error('Delete expense error:', error);
      res.status(500).json({ message: 'Failed to delete expense' });
    }
  }
  
  async getExpenseReport(req, res) {
    try {
      const { startDate, endDate, groupBy = 'category' } = req.query;
      
      const where = {};
      if (startDate && endDate) {
        where.date = {
          [Op.between]: [startDate, endDate]
        };
      }
      
      // Get expenses grouped by category
      const categoryExpenses = await Expense.findAll({
        where,
        attributes: [
          'category',
          [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['category']
      });
      
      // Get monthly trend
      const monthlyTrend = await Expense.findAll({
        where,
        attributes: [
          [sequelize.fn('DATE_FORMAT', sequelize.col('date'), '%Y-%m'), 'month'],
          [sequelize.fn('SUM', sequelize.col('amount')), 'total']
        ],
        group: [sequelize.fn('DATE_FORMAT', sequelize.col('date'), '%Y-%m')],
        order: [[sequelize.fn('DATE_FORMAT', sequelize.col('date'), '%Y-%m'), 'ASC']]
      });
      
      // Calculate totals
      const totalExpense = await Expense.sum('amount', { where });
      
      res.json({
        categoryBreakdown: categoryExpenses,
        monthlyTrend,
        summary: {
          totalExpense: totalExpense || 0,
          period: {
            from: startDate,
            to: endDate
          }
        }
      });
    } catch (error) {
      logger.error('Get expense report error:', error);
      res.status(500).json({ message: 'Failed to generate expense report' });
    }
  }
  
  async getRecurringExpenses(req, res) {
    try {
      const recurringExpenses = await Expense.findAll({
        where: { recurring: true },
        order: [['createdAt', 'DESC']]
      });
      
      res.json(recurringExpenses);
    } catch (error) {
      logger.error('Get recurring expenses error:', error);
      res.status(500).json({ message: 'Failed to fetch recurring expenses' });
    }
  }
}

module.exports = new ExpenseController();