// backend/src/controllers/movementController.js
const { Movement, Student, User } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class MovementController {
  // Get all movements with filters (Admin/Staff)
  async getAllMovements(req, res) {
    try {
      const { page = 1, limit = 10, studentId, type, status, date, isAtHome } = req.query;
      
      const where = {};
      if (studentId) where.studentId = studentId;
      if (type) where.type = type;
      if (status) where.status = status;
      if (date) {
        where.createdAt = {
          [Op.gte]: new Date(date),
          [Op.lt]: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)
        };
      }
      
      // Filter for students currently at home
      if (isAtHome === 'true') {
        where.type = 'home_leave';
        where.status = 'active';
      }
      
      const movements = await Movement.findAndCountAll({
        where,
        include: [{
          model: Student,
          as: 'student',
          attributes: ['id', 'fullName', 'studentId', 'roomId', 'phone', 'guardianPhone']
        }],
        limit: parseInt(limit),
        offset: (page - 1) * limit,
        order: [['createdAt', 'DESC']]
      });
      
      res.json({
        movements: movements.rows,
        total: movements.count,
        currentPage: parseInt(page),
        totalPages: Math.ceil(movements.count / limit)
      });
    } catch (error) {
      logger.error('Get movements error:', error);
      res.status(500).json({ message: 'Failed to fetch movements' });
    }
  }

  // Get current status for logged-in student
  async getMovementStatus(req, res) {
    try {
      const userId = req.user.id;
      
      const student = await Student.findOne({ where: { userId } });
      
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
      
      // Get active home leave if any
      const activeHomeLeave = await Movement.findOne({
        where: { 
          studentId: student.id,
          type: 'home_leave',
          status: 'active'
        },
        order: [['createdAt', 'DESC']]
      });
      
      // Get last movement
      const lastMovement = await Movement.findOne({
        where: { studentId: student.id },
        order: [['createdAt', 'DESC']]
      });
      
      let status = 'in'; // Default status
      let location = 'hostel'; // Default location
      
      if (activeHomeLeave) {
        status = 'out';
        location = 'home';
      } else if (lastMovement) {
        if (lastMovement.type === 'check_out' && 
            (lastMovement.status === 'pending' || lastMovement.status === 'approved' || lastMovement.status === 'active')) {
          status = 'out';
          location = 'local_out';
        }
      }
      
      res.json({
        status,
        location,
        activeHomeLeave,
        lastMovement,
        studentId: student.id
      });
    } catch (error) {
      logger.error('Get movement status error:', error);
      res.status(500).json({ 
        message: 'Failed to fetch movement status',
        error: error.message 
      });
    }
  }

  // Get movements for logged-in student
  async getMyMovements(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10 } = req.query;
      
      const student = await Student.findOne({ where: { userId } });
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
      
      const movements = await Movement.findAndCountAll({
        where: { studentId: student.id },
        limit: parseInt(limit),
        offset: (page - 1) * limit,
        order: [['createdAt', 'DESC']]
      });
      
      res.json({
        movements: movements.rows,
        total: movements.count,
        currentPage: parseInt(page),
        totalPages: Math.ceil(movements.count / limit)
      });
    } catch (error) {
      logger.error('Get my movements error:', error);
      res.status(500).json({ message: 'Failed to fetch movements' });
    }
  }

  // Create movement (including home leave)
  async createMovement(req, res) {
    try {
      const userId = req.user.id;
      const { type, reason, expectedReturnTime, destination, emergencyContact, transportMode, remarks } = req.body;
      
      const student = await Student.findOne({ where: { userId } });
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
      
      // Check for active home leave
      const activeHomeLeave = await Movement.findOne({
        where: { 
          studentId: student.id,
          type: 'home_leave',
          status: 'active'
        }
      });
      
      // Check for active local out
      const activeCheckOut = await Movement.findOne({
        where: { 
          studentId: student.id,
          type: 'check_out',
          status: { [Op.in]: ['active', 'approved', 'pending'] }
        }
      });
      
      // Validation based on movement type
      if (type === 'home_leave') {
        if (activeHomeLeave) {
          return res.status(400).json({ 
            message: 'You already have an active home leave. Please return first.' 
          });
        }
        if (activeCheckOut) {
          return res.status(400).json({ 
            message: 'You have an active local check-out. Please check in first before leaving for home.' 
          });
        }
      }
      
      if (type === 'home_return' && !activeHomeLeave) {
        return res.status(400).json({ 
          message: 'No active home leave found to return from.' 
        });
      }
      
      if (type === 'check_out') {
        if (activeHomeLeave) {
          return res.status(400).json({ 
            message: 'You are currently on home leave. Please return from home first.' 
          });
        }
        if (activeCheckOut) {
          return res.status(400).json({ 
            message: 'You already have an active check-out. Please check in first.' 
          });
        }
      }
      
      if (type === 'check_in' && !activeCheckOut) {
        return res.status(400).json({ 
          message: 'No active check-out found to check in from.' 
        });
      }
      
      // Create movement record
      const movementData = {
        studentId: student.id,
        type,
        reason,
        status: type === 'home_return' || type === 'check_in' ? 'completed' : 'active',
        remarks,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Add type-specific fields
      if (type === 'home_leave') {
        movementData.checkOutTime = new Date();
        movementData.destination = destination;
        movementData.emergencyContact = emergencyContact || student.guardianPhone;
        movementData.transportMode = transportMode;
        if (expectedReturnTime) {
          movementData.expectedReturnTime = new Date(expectedReturnTime);
        }
      } else if (type === 'home_return') {
        movementData.checkInTime = new Date();
        movementData.actualReturnTime = new Date();
        
        // Update the active home leave
        if (activeHomeLeave) {
          await activeHomeLeave.update({ 
            status: 'completed',
            actualReturnTime: new Date()
          });
        }
      } else if (type === 'check_out') {
        movementData.checkOutTime = new Date();
        if (expectedReturnTime) {
          movementData.expectedReturnTime = new Date(expectedReturnTime);
        }
      } else if (type === 'check_in') {
        movementData.checkInTime = new Date();
        movementData.actualReturnTime = new Date();
        
        // Update the active check-out
        if (activeCheckOut) {
          await activeCheckOut.update({ 
            status: 'completed',
            actualReturnTime: new Date()
          });
        }
      }
      
      const movement = await Movement.create(movementData);
      
      // Log the movement for audit
      logger.info(`Movement created: ${type} for student ${student.studentId}`);
      
      res.status(201).json({
        message: `${type.replace(/_/g, ' ').charAt(0).toUpperCase() + type.replace(/_/g, ' ').slice(1)} recorded successfully`,
        movement
      });
    } catch (error) {
      logger.error('Create movement error:', error);
      res.status(500).json({ 
        message: 'Failed to create movement record',
        error: error.message 
      });
    }
  }

  // Get dashboard statistics (Admin)
  async getMovementStats(req, res) {
    try {
      // Get all active students
      const totalStudents = await Student.count({ where: { status: 'active' } });
      
      // Students currently at home
      const studentsAtHome = await Movement.count({
        where: {
          type: 'home_leave',
          status: 'active'
        }
      });
      
      // Students currently out (local)
      const studentsLocalOut = await Movement.count({
        where: {
          type: 'check_out',
          status: { [Op.in]: ['active', 'pending', 'approved'] }
        }
      });
      
      // Students in hostel
      const studentsInHostel = totalStudents - studentsAtHome - studentsLocalOut;
      
      // Today's movements
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayMovements = await Movement.count({
        where: {
          createdAt: { [Op.gte]: today }
        }
      });
      
      // Overdue returns
      const overdueReturns = await Movement.findAll({
        where: {
          type: { [Op.in]: ['home_leave', 'check_out'] },
          status: { [Op.in]: ['active', 'approved', 'pending'] },
          expectedReturnTime: {
            [Op.lt]: new Date(),
            [Op.ne]: null
          }
        },
        include: [{
          model: Student,
          as: 'student',
          attributes: ['fullName', 'studentId', 'phone', 'guardianPhone', 'roomId']
        }],
        order: [['expectedReturnTime', 'ASC']]
      });
      
      res.json({
        stats: {
          totalStudents,
          studentsInHostel,
          studentsAtHome,
          studentsLocalOut,
          todayMovements,
          overdueReturnsCount: overdueReturns.length
        },
        overdueReturns
      });
    } catch (error) {
      logger.error('Get movement stats error:', error);
      res.status(500).json({ message: 'Failed to fetch movement statistics' });
    }
  }

  // Get students currently at home (Admin)
  async getStudentsAtHome(req, res) {
    try {
      const homeLeaves = await Movement.findAll({
        where: {
          type: 'home_leave',
          status: 'active'
        },
        include: [{
          model: Student,
          as: 'student',
          attributes: ['id', 'fullName', 'studentId', 'roomId', 'phone', 'guardianPhone', 'email']
        }],
        order: [['checkOutTime', 'DESC']]
      });
      
      res.json({
        studentsAtHome: homeLeaves,
        total: homeLeaves.length
      });
    } catch (error) {
      logger.error('Get students at home error:', error);
      res.status(500).json({ message: 'Failed to fetch students at home' });
    }
  }

  // Update movement (Admin/Staff only)
  async updateMovement(req, res) {
    try {
      const movement = await Movement.findByPk(req.params.id);
      
      if (!movement) {
        return res.status(404).json({ message: 'Movement not found' });
      }
      
      await movement.update(req.body);
      
      res.json({
        message: 'Movement updated successfully',
        movement
      });
    } catch (error) {
      logger.error('Update movement error:', error);
      res.status(500).json({ message: 'Failed to update movement' });
    }
  }

  // Delete movement (Admin only)
  async deleteMovement(req, res) {
    try {
      const movement = await Movement.findByPk(req.params.id);
      
      if (!movement) {
        return res.status(404).json({ message: 'Movement not found' });
      }
      
      await movement.destroy();
      
      res.json({ message: 'Movement deleted successfully' });
    } catch (error) {
      logger.error('Delete movement error:', error);
      res.status(500).json({ message: 'Failed to delete movement' });
    }
  }

  // Approve/Reject movement (Admin/Staff)
  async approveMovement(req, res) {
    try {
      const { id } = req.params;
      const { status, remarks } = req.body;
      
      const movement = await Movement.findByPk(id);
      
      if (!movement) {
        return res.status(404).json({ message: 'Movement not found' });
      }
      
      await movement.update({
        status,
        remarks,
        approvedBy: req.user.id
      });
      
      res.json({
        message: `Movement ${status} successfully`,
        movement
      });
    } catch (error) {
      logger.error('Approve movement error:', error);
      res.status(500).json({ message: 'Failed to approve movement' });
    }
  }

  // Get movement report (Admin/Staff)
  async getMovementReport(req, res) {
    try {
      const { startDate, endDate, studentId } = req.query;
      
      const where = {};
      if (startDate && endDate) {
        where.createdAt = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }
      if (studentId) where.studentId = studentId;
      
      const movements = await Movement.findAll({
        where,
        include: [{
          model: Student,
          as: 'student',
          attributes: ['id', 'fullName', 'studentId', 'roomId']
        }],
        order: [['createdAt', 'DESC']]
      });
      
      // Generate statistics
      const stats = {
        totalMovements: movements.length,
        checkOuts: movements.filter(m => m.type === 'check_out').length,
        checkIns: movements.filter(m => m.type === 'check_in').length,
        homeLeaves: movements.filter(m => m.type === 'home_leave').length,
        homeReturns: movements.filter(m => m.type === 'home_return').length,
        pendingApprovals: movements.filter(m => m.status === 'pending').length,
        completed: movements.filter(m => m.status === 'completed').length,
        active: movements.filter(m => m.status === 'active').length
      };
      
      res.json({
        movements,
        stats,
        period: {
          from: startDate,
          to: endDate
        }
      });
    } catch (error) {
      logger.error('Get movement report error:', error);
      res.status(500).json({ message: 'Failed to generate movement report' });
    }
  }

  // Get students by current location (Admin)
  async getStudentsByLocation(req, res) {
    try {
      const students = await Student.findAll({
        where: { status: 'active' },
        attributes: ['id', 'fullName', 'studentId', 'roomId', 'phone']
      });

      const studentLocations = await Promise.all(students.map(async (student) => {
        // Get active home leave
        const activeHomeLeave = await Movement.findOne({
          where: { 
            studentId: student.id,
            type: 'home_leave',
            status: 'active'
          }
        });

        // Get active check out
        const activeCheckOut = await Movement.findOne({
          where: { 
            studentId: student.id,
            type: 'check_out',
            status: { [Op.in]: ['active', 'approved', 'pending'] }
          }
        });

        let location = 'hostel';
        let movement = null;

        if (activeHomeLeave) {
          location = 'home';
          movement = activeHomeLeave;
        } else if (activeCheckOut) {
          location = 'local_out';
          movement = activeCheckOut;
        }

        return {
          student: student.toJSON(),
          location,
          movement
        };
      }));

      const summary = {
        inHostel: studentLocations.filter(s => s.location === 'hostel'),
        atHome: studentLocations.filter(s => s.location === 'home'),
        localOut: studentLocations.filter(s => s.location === 'local_out')
      };

      res.json({
        studentLocations,
        summary: {
          inHostelCount: summary.inHostel.length,
          atHomeCount: summary.atHome.length,
          localOutCount: summary.localOut.length,
          total: students.length
        },
        details: summary
      });
    } catch (error) {
      logger.error('Get students by location error:', error);
      res.status(500).json({ message: 'Failed to fetch students by location' });
    }
  }
}

module.exports = new MovementController();