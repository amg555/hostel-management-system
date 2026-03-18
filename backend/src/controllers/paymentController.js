const { Payment, Student, Room } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class PaymentController {
  async getAllPayments(req, res) {
    try {
      const { page = 1, limit = 10, studentId, status, monthYear } = req.query;
      
      const where = {};
      if (studentId) where.studentId = studentId;
      if (status) where.status = status;
      if (monthYear) where.monthYear = monthYear;
      
      const payments = await Payment.findAndCountAll({
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
        payments: payments.rows,
        total: payments.count,
        currentPage: parseInt(page),
        totalPages: Math.ceil(payments.count / limit)
      });
    } catch (error) {
      logger.error('Get payments error:', error);
      res.status(500).json({ message: 'Failed to fetch payments' });
    }
  }

  async getPaymentStatus(req, res) {
    try {
      const userId = req.user.id;
      console.log('Getting payment status for userId:', userId);
      
      // Get student with room
      const student = await Student.findOne({ 
        where: { userId },
        include: [{
          model: Room,
          as: 'room',
          required: false,
          attributes: ['id', 'roomNumber', 'monthlyRent']
        }]
      });
      
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
      
      // Fix room rentAmount field for compatibility
      const roomDetails = student.room ? {
        ...student.room.toJSON(),
        rentAmount: student.room.monthlyRent
      } : null;
      
      // Get current date info
      const currentDate = new Date();
      const currentMonth = currentDate.toISOString().slice(0, 7);
      
      // Get current month payment status
      let currentPayment = null;
      try {
        currentPayment = await Payment.findOne({
          where: {
            studentId: student.id,
            monthYear: currentMonth
          }
        });
      } catch (e) {
        console.log('Current payment query failed:', e.message);
      }
      
      // Get last payment
      let lastPayment = null;
      try {
        lastPayment = await Payment.findOne({
          where: { studentId: student.id },
          order: [['createdAt', 'DESC']]
        });
      } catch (e) {
        console.log('Last payment query failed:', e.message);
      }
      
      // Calculate due amount
      const dueAmount = student.room?.monthlyRent || 0;
      const isPaid = currentPayment && currentPayment.status === 'completed';
      
      // Calculate next due date (5th of next month if current month is paid, otherwise 5th of current month)
      let nextDueDate;
      if (isPaid) {
        nextDueDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 5);
      } else {
        nextDueDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 5);
      }
      
      res.json({
        status: isPaid ? 'Paid' : 'Pending',
        currentMonthStatus: currentPayment ? currentPayment.status : 'pending',
        currentMonthPaid: isPaid,
        lastPaymentDate: lastPayment?.paymentDate || lastPayment?.paidDate || null,
        dueAmount,
        amountDue: isPaid ? 0 : dueAmount,
        currentMonth,
        nextDueDate,
        paymentDetails: currentPayment,
        roomDetails
      });
    } catch (error) {
      logger.error('Get payment status error:', error);
      res.status(500).json({ 
        message: 'Failed to fetch payment status',
        error: error.message 
      });
    }
  }

  async getMyPayments(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10 } = req.query;
      
      // Get student
      const student = await Student.findOne({ where: { userId } });
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
      
      const payments = await Payment.findAndCountAll({
        where: { studentId: student.id },
        limit: parseInt(limit),
        offset: (page - 1) * limit,
        order: [['createdAt', 'DESC']]
      });
      
      res.json({
        payments: payments.rows,
        total: payments.count,
        currentPage: parseInt(page),
        totalPages: Math.ceil(payments.count / limit)
      });
    } catch (error) {
      logger.error('Get my payments error:', error);
      res.status(500).json({ message: 'Failed to fetch payments' });
    }
  }
  
  async recordOfflinePayment(req, res) {
    try {
      const paymentData = req.body;
      
      // Generate receipt number
      const date = new Date();
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const lastPayment = await Payment.findOne({
        where: {
          receiptNumber: {
            [Op.like]: `RCP${year}${month}%`
          }
        },
        order: [['createdAt', 'DESC']]
      });
      
      const sequence = lastPayment 
        ? parseInt(lastPayment.receiptNumber.slice(-4)) + 1 
        : 1;
      paymentData.receiptNumber = `RCP${year}${month}${sequence.toString().padStart(4, '0')}`;
      
      // Check for late payment
      const dueDate = new Date(date.getFullYear(), date.getMonth(), 5);
      if (date > dueDate && paymentData.paymentType === 'monthly_rent') {
        paymentData.isLatePayment = true;
        paymentData.lateFee = 100; // Configure late fee amount
        paymentData.amount = parseFloat(paymentData.amount) + 100;
      }
      
      paymentData.collectedBy = req.user.id;
      paymentData.status = 'completed';
      paymentData.paymentDate = new Date();
      paymentData.paidDate = new Date();
      
      const payment = await Payment.create(paymentData);
      
      res.status(201).json({
        message: 'Payment recorded successfully',
        payment
      });
    } catch (error) {
      logger.error('Record payment error:', error);
      res.status(500).json({ message: 'Failed to record payment' });
    }
  }
  
  async getPaymentById(req, res) {
    try {
      const payment = await Payment.findByPk(req.params.id, {
        include: [{
          model: Student,
          as: 'student'
        }]
      });
      
      if (!payment) {
        return res.status(404).json({ message: 'Payment not found' });
      }
      
      res.json(payment);
    } catch (error) {
      logger.error('Get payment error:', error);
      res.status(500).json({ message: 'Failed to fetch payment' });
    }
  }
  
  async updatePayment(req, res) {
    try {
      const payment = await Payment.findByPk(req.params.id);
      
      if (!payment) {
        return res.status(404).json({ message: 'Payment not found' });
      }
      
      await payment.update(req.body);
      
      res.json({
        message: 'Payment updated successfully',
        payment
      });
    } catch (error) {
      logger.error('Update payment error:', error);
      res.status(500).json({ message: 'Failed to update payment' });
    }
  }
  
  async getPendingPayments(req, res) {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7);
      
      const students = await Student.findAll({
        where: { status: 'active' },
        include: [{
          model: Payment,
          as: 'payments',
          where: {
            monthYear: currentMonth,
            status: 'completed'
          },
          required: false
        }]
      });
      
      const pendingStudents = students.filter(student => 
        !student.payments || student.payments.length === 0
      );
      
      res.json({
        pendingCount: pendingStudents.length,
        students: pendingStudents
      });
    } catch (error) {
      logger.error('Get pending payments error:', error);
      res.status(500).json({ message: 'Failed to fetch pending payments' });
    }
  }
  
  async generateReceipt(req, res) {
    try {
      const payment = await Payment.findByPk(req.params.id, {
        include: [{
          model: Student,
          as: 'student',
          include: [{
            model: Room,
            as: 'room'
          }]
        }]
      });
      
      if (!payment) {
        return res.status(404).json({ message: 'Payment not found' });
      }
      
      res.json({
        message: 'Receipt generated',
        payment
      });
    } catch (error) {
      logger.error('Generate receipt error:', error);
      res.status(500).json({ message: 'Failed to generate receipt' });
    }
  }
}

module.exports = new PaymentController();