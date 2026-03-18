const { Room, Student } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../models');
const logger = require('../utils/logger');

class RoomController {
  async getAllRooms(req, res) {
    try {
      const { page = 1, limit = 10, status, floor, type } = req.query;
      
      const where = {};
      if (status) where.status = status;
      if (floor) where.floor = floor;
      if (type) where.type = type;
      
      const rooms = await Room.findAndCountAll({
        where,
        include: [{
          model: Student,
          as: 'students',
          attributes: ['id', 'fullName', 'studentId'],
          required: false
        }],
        limit: parseInt(limit),
        offset: (page - 1) * limit,
        order: [['roomNumber', 'ASC']]
      });
      
      // Calculate statistics
      const stats = await Room.findOne({
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'totalRooms'],
          [sequelize.fn('SUM', sequelize.col('capacity')), 'totalCapacity'],
          [sequelize.fn('SUM', sequelize.col('currentOccupancy')), 'totalOccupied']
        ],
        raw: true
      });
      
      res.json({
        rooms: rooms.rows,
        total: rooms.count,
        currentPage: parseInt(page),
        totalPages: Math.ceil(rooms.count / limit),
        statistics: stats
      });
    } catch (error) {
      logger.error('Get rooms error:', error);
      res.status(500).json({ message: 'Failed to fetch rooms' });
    }
  }
  
  async getRoomById(req, res) {
    try {
      const room = await Room.findByPk(req.params.id, {
        include: [{
          model: Student,
          as: 'students'
        }]
      });
      
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }
      
      res.json(room);
    } catch (error) {
      logger.error('Get room error:', error);
      res.status(500).json({ message: 'Failed to fetch room' });
    }
  }
  
  async createRoom(req, res) {
    try {
      const { 
        roomNumber, 
        floor, 
        capacity, 
        type, 
        monthlyRent, 
        building,
        amenities,
        description 
      } = req.body;
      
      // Check if room number already exists
      const existingRoom = await Room.findOne({
        where: { roomNumber }
      });
      
      if (existingRoom) {
        return res.status(400).json({ message: 'Room number already exists' });
      }
      
      // Create room with proper field mapping
      const room = await Room.create({
        roomNumber,
        floor: parseInt(floor),
        capacity: parseInt(capacity),
        currentOccupancy: 0,
        type: type || 'double',
        monthlyRent: parseFloat(monthlyRent),
        building: building || 'Main',
        amenities: amenities || [],
        description,
        status: 'available'
      });
      
      res.status(201).json({
        message: 'Room created successfully',
        room
      });
    } catch (error) {
      logger.error('Create room error:', error);
      res.status(500).json({ message: error.message || 'Failed to create room' });
    }
  }
  
  async updateRoom(req, res) {
    try {
      const room = await Room.findByPk(req.params.id);
      
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }
      
      await room.update(req.body);
      
      res.json({
        message: 'Room updated successfully',
        room
      });
    } catch (error) {
      logger.error('Update room error:', error);
      res.status(500).json({ message: 'Failed to update room' });
    }
  }
  
  async deleteRoom(req, res) {
    try {
      const room = await Room.findByPk(req.params.id);
      
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }
      
      // Check if room has students
      if (room.currentOccupancy > 0) {
        return res.status(400).json({ 
          message: 'Cannot delete room with active students' 
        });
      }
      
      await room.destroy();
      
      res.json({ message: 'Room deleted successfully' });
    } catch (error) {
      logger.error('Delete room error:', error);
      res.status(500).json({ message: 'Failed to delete room' });
    }
  }
  
  async getAvailableRooms(req, res) {
    try {
      const rooms = await Room.findAll({
        where: {
          status: 'available',
          [Op.and]: [
            sequelize.literal('"currentOccupancy" < "capacity"')
          ]
        },
        order: [['roomNumber', 'ASC']]
      });
      
      res.json(rooms);
    } catch (error) {
      logger.error('Get available rooms error:', error);
      res.status(500).json({ message: 'Failed to fetch available rooms' });
    }
  }
  
  async getRoomOccupancyStats(req, res) {
    try {
      const stats = await Room.findAll({
        attributes: [
          'floor',
          [sequelize.fn('COUNT', sequelize.col('id')), 'totalRooms'],
          [sequelize.fn('SUM', sequelize.col('capacity')), 'totalCapacity'],
          [sequelize.fn('SUM', sequelize.col('currentOccupancy')), 'occupied']
        ],
        group: ['floor'],
        raw: true
      });
      
      res.json(stats);
    } catch (error) {
      logger.error('Get occupancy stats error:', error);
      res.status(500).json({ message: 'Failed to fetch occupancy stats' });
    }
  }
}

module.exports = new RoomController();