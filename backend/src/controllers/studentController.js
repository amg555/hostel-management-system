// backend/src/controllers/studentController.js
const { Student, Room, Payment, Movement, Complaint, User, Notice } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const bcrypt = require('bcryptjs');
const emailService = require('../services/emailService');
const helpers = require('../utils/helpers');

class StudentController {
  async getAllStudents(req, res) {
    try {
      const { page = 1, limit = 10, search, status, roomId } = req.query;
      
      const where = {};
      if (search) {
        where[Op.or] = [
          { fullName: { [Op.like]: `%${search}%` } },
          { studentId: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } }
        ];
      }
      if (status) where.status = status;
      if (roomId) where.roomId = roomId;
      
      const students = await Student.findAndCountAll({
        where,
        include: [{
          model: Room,
          as: 'room',
          required: false
        }],
        limit: parseInt(limit),
        offset: (page - 1) * limit,
        order: [['createdAt', 'DESC']]
      });
      
      res.json({
        students: students.rows,
        total: students.count,
        currentPage: parseInt(page),
        totalPages: Math.ceil(students.count / limit)
      });
    } catch (error) {
      logger.error('Get students error:', error);
      res.status(500).json({ message: 'Failed to fetch students' });
    }
  }

  async getProfile(req, res) {
    try {
      const userId = req.user.id;
      console.log('Getting profile for userId:', userId);
      
      const student = await Student.findOne({
        where: { userId },
        include: [
          {
            model: Room,
            as: 'room',
            required: false,
            attributes: ['id', 'roomNumber', 'floor', 'capacity', 'currentOccupancy', 'monthlyRent']
          }
        ]
      });
      
      if (!student) {
        return res.status(404).json({ message: 'Student profile not found' });
      }
      
      // Add additional calculated fields
      const studentData = student.toJSON();
      
      // Use custom rent amount if set, otherwise use room's monthly rent
      const rentAmount = student.customRentAmount || student.room?.monthlyRent || 0;
      
      // Ensure rentAmount field exists (some places expect rentAmount instead of monthlyRent)
      if (student.room) {
        studentData.room.rentAmount = rentAmount;
      }
      
      studentData.roomDetails = {
        roomNumber: student.room?.roomNumber || 'Not Assigned',
        floor: student.room?.floor || '-',
        rentAmount: rentAmount,
        occupancy: student.room ? `${student.room.currentOccupancy}/${student.room.capacity}` : '-'
      };
      
      res.json(studentData);
    } catch (error) {
      logger.error('Get profile error:', error);
      res.status(500).json({ 
        message: 'Failed to fetch profile',
        error: error.message 
      });
    }
  }

  async getDashboard(req, res) {
    try {
      const userId = req.user.id;
      console.log('Getting dashboard for userId:', userId);
      
      // Get student details
      const student = await Student.findOne({
        where: { userId },
        include: [
          {
            model: Room,
            as: 'room',
            required: false,
            attributes: ['id', 'roomNumber', 'floor', 'monthlyRent', 'capacity', 'currentOccupancy']
          }
        ]
      });
      
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
      
      // Use custom rent amount if set, otherwise use room's monthly rent
      const monthlyRent = student.customRentAmount || student.room?.monthlyRent || 0;
      
      // Fix room rentAmount field
      if (student.room) {
        student.room.dataValues.rentAmount = monthlyRent;
      }
      
      // Get current date info
      const currentDate = new Date();
      const currentMonth = currentDate.toISOString().slice(0, 7);
      const admissionDate = student.admissionDate ? new Date(student.admissionDate) : currentDate;
      const daysInHostel = Math.floor((currentDate - admissionDate) / (1000 * 60 * 60 * 24));
      
      // Get payment summary with error handling
      let payments = [];
      let currentMonthPayment = null;
      
      try {
        payments = await Payment.findAll({
          where: { studentId: student.id },
          order: [['createdAt', 'DESC']],
          limit: 5
        });
        
        currentMonthPayment = await Payment.findOne({
          where: {
            studentId: student.id,
            monthYear: currentMonth
          }
        });
      } catch (e) {
        console.log('Payment queries skipped:', e.message);
      }
      
      // Get recent complaints with error handling
      let complaints = [];
      let activeComplaints = 0;
      let resolvedComplaints = 0;
      
      try {
        complaints = await Complaint.findAll({
          where: { studentId: student.id },
          order: [['createdAt', 'DESC']],
          limit: 5
        });
        
        const complaintStats = await Complaint.findAll({
          where: { studentId: student.id },
          attributes: ['status']
        });
        
        activeComplaints = complaintStats.filter(c => c.status !== 'resolved').length;
        resolvedComplaints = complaintStats.filter(c => c.status === 'resolved').length;
      } catch (e) {
        console.log('Complaint queries skipped:', e.message);
      }
      
      // Get recent notices
      let notices = [];
      try {
        notices = await Notice.findAll({
          where: {
            isActive: true,
            [Op.or]: [
              { targetAudience: 'all' },
              { targetAudience: 'students' }
            ]
          },
          order: [['createdAt', 'DESC']],
          limit: 3
        });
      } catch (e) {
        console.log('Notice queries skipped:', e.message);
      }
      
      // Get movement data with error handling
      let movements = [];
      let currentMovementStatus = 'in';
      
      try {
        movements = await Movement.findAll({
          where: { studentId: student.id },
          order: [['createdAt', 'DESC']],
          limit: 5
        });
        
        // Get latest movement to determine current status
        const latestMovement = movements[0];
        if (latestMovement) {
          if (latestMovement.type === 'check_out' && latestMovement.status !== 'completed') {
            currentMovementStatus = 'out';
          }
        }
      } catch (e) {
        console.log('Movement queries skipped:', e.message);
      }
      
      // Calculate pending amount
      const pendingAmount = currentMonthPayment ? 
        (currentMonthPayment.status === 'completed' ? 0 : monthlyRent) : 
        monthlyRent;
      
      // Format current month for display
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
        'July', 'August', 'September', 'October', 'November', 'December'];
      const currentMonthDisplay = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
      
      // Calculate stats
      const stats = {
        totalPayments: payments.length,
        pendingPayments: payments.filter(p => p.status === 'pending').length,
        activeComplaints,
        resolvedComplaints,
        totalComplaints: complaints.length,
        roomNumber: student.room?.roomNumber || 'Not Assigned',
        monthlyRent,
        unreadNotices: notices.length,
        totalNotices: notices.length,
        movementStatus: currentMovementStatus
      };
      
      // Prepare response with safe room data
      const roomData = student.room ? {
        ...student.room.toJSON(),
        rentAmount: monthlyRent // Add rentAmount field for compatibility
      } : null;
      
      res.json({
        student: {
          ...student.toJSON(),
          roomNumber: student.room?.roomNumber || 'Not Assigned',
          floor: student.room?.floor || '-',
          roomType: 'Standard',
          roomOccupancy: student.room ? `${student.room.currentOccupancy}/${student.room.capacity}` : '-',
          monthlyRent // Include the effective monthly rent
        },
        stats,
        recentPayments: payments,
        recentComplaints: complaints,
        notices,
        movements,
        pendingAmount,
        openComplaints: activeComplaints,
        currentMonth: currentMonthDisplay,
        daysInHostel,
        room: roomData
      });
    } catch (error) {
      logger.error('Get dashboard error:', error);
      res.status(500).json({ 
        message: 'Failed to fetch dashboard data',
        error: error.message 
      });
    }
  }

  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const updates = req.body;
      
      // Find student by userId
      const student = await Student.findOne({ where: { userId } });
      
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
      
      // Only allow certain fields to be updated by students
      const allowedUpdates = [
        'phone',
        'alternatePhone',
        'currentAddress',
        'guardianPhone',
        'profilePicture'
      ];
      
      const filteredUpdates = {};
      allowedUpdates.forEach(field => {
        if (updates[field] !== undefined) {
          filteredUpdates[field] = updates[field];
        }
      });
      
      await student.update(filteredUpdates);
      
      res.json({
        message: 'Profile updated successfully',
        student
      });
    } catch (error) {
      logger.error('Update profile error:', error);
      res.status(500).json({ message: 'Failed to update profile' });
    }
  }

  async uploadProfilePicture(req, res) {
    try {
      const userId = req.user.id;
      
      // Find student by userId
      const student = await Student.findOne({ where: { userId } });
      
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
      
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      // Create the URL for the uploaded file
      const profilePictureUrl = `/uploads/${req.file.filename}`;
      
      // Update student profile picture
      await student.update({ profilePicture: profilePictureUrl });
      
      res.json({
        message: 'Profile picture uploaded successfully',
        profilePicture: profilePictureUrl
      });
    } catch (error) {
      logger.error('Upload profile picture error:', error);
      res.status(500).json({ message: 'Failed to upload profile picture' });
    }
  }

  async register(req, res) {
    try {
      // Student self-registration logic (if needed)
      res.status(501).json({ message: 'Student registration not implemented' });
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({ message: 'Registration failed' });
    }
  }
  
  async getStudentById(req, res) {
    try {
      const student = await Student.findByPk(req.params.id, {
        include: [
          { model: Room, as: 'room' }
        ]
      });
      
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
      
      res.json(student);
    } catch (error) {
      logger.error('Get student error:', error);
      res.status(500).json({ message: 'Failed to fetch student' });
    }
  }
  
  async createStudent(req, res) {
    let user = null;
    let student = null;
    
    try {
      const studentData = req.body;
      
      // Log the incoming data for debugging
      logger.info('Creating student with data:', {
        email: studentData.email,
        rollNumber: studentData.rollNumber,
        fullName: studentData.fullName
      });
      
      // Validate required fields
      if (!studentData.email || !studentData.fullName || !studentData.rollNumber) {
        return res.status(400).json({ 
          message: 'Email, full name, and roll number are required' 
        });
      }
      
      // Check if email already exists
      const existingUser = await User.findOne({ 
        where: { email: studentData.email } 
      });
      
      if (existingUser) {
        logger.warn('Email already exists:', studentData.email);
        return res.status(400).json({ 
          message: 'Email already registered' 
        });
      }

      // Check if roll number exists
      if (studentData.rollNumber) {
        const existingStudent = await Student.findOne({ 
          where: { rollNumber: studentData.rollNumber } 
        });
        if (existingStudent) {
          logger.warn('Roll number already exists:', studentData.rollNumber);
          return res.status(400).json({ 
            message: 'Roll number already registered' 
          });
        }
      }

      // Generate temporary password using the helper function
      const temporaryPassword = helpers.generateTemporaryPassword ? 
        helpers.generateTemporaryPassword() : 
        this.generateTemporaryPassword();
      
      // Hash the password before saving
      const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
      
      // Create user account with hashed password
      user = await User.create({
        email: studentData.email,
        password: hashedPassword, // Use hashed password
        role: 'student',
        isActive: true,
        requirePasswordChange: true
      });
      
      logger.info('User created with ID:', user.id);

      // Generate student ID
      const year = new Date().getFullYear();
      const count = await Student.count() + 1;
      const studentId = `STU${year}${count.toString().padStart(4, '0')}`;
      
      // Format dates properly
      const formattedDateOfBirth = studentData.dateOfBirth ? new Date(studentData.dateOfBirth) : null;
      const formattedAdmissionDate = studentData.admissionDate ? new Date(studentData.admissionDate) : new Date();
      
      // Parse custom rent amount
      const customRentAmount = studentData.customRentAmount ? 
        parseFloat(studentData.customRentAmount) : null;
      
      // Create student record with all the fields from the form
      student = await Student.create({
        userId: user.id,
        studentId: studentId,
        fullName: studentData.fullName,
        rollNumber: studentData.rollNumber,
        email: studentData.email,
        phone: studentData.phone || '',
        alternatePhone: studentData.alternatePhone || null,
        dateOfBirth: formattedDateOfBirth,
        gender: studentData.gender || 'other',
        permanentAddress: studentData.permanentAddress || '',
        currentAddress: studentData.currentAddress || null,
        guardianName: studentData.guardianName || '',
        guardianPhone: studentData.guardianPhone || '',
        guardianRelation: studentData.guardianRelation || null,
        bloodGroup: studentData.bloodGroup || null,
        collegeName: studentData.collegeName || null,
        course: studentData.course || null,
        department: studentData.department || '',
        academicYear: studentData.academicYear || null,
        roomId: studentData.roomId || null,
        admissionDate: formattedAdmissionDate,
        customRentAmount: customRentAmount,
        status: 'active'
      });
      
      logger.info('Student created with ID:', student.id);
      
      // Check room availability and update occupancy
      if (studentData.roomId && studentData.roomId !== '') {
        const room = await Room.findByPk(studentData.roomId);
        if (room) {
          if (room.currentOccupancy >= room.capacity) {
            // Rollback student and user creation
            await student.destroy();
            await user.destroy();
            logger.warn('Room is full:', studentData.roomId);
            return res.status(400).json({ message: 'Room is full' });
          }
          // Update room occupancy
          await room.increment('currentOccupancy');
          logger.info('Room occupancy updated for room:', studentData.roomId);
        }
      }
      
      // Try to send credentials email automatically
      let emailSent = false;
      if (emailService && emailService.isServiceConfigured && emailService.isServiceConfigured()) {
        try {
          await emailService.sendStudentCredentials(
            studentData.email,
            studentId,
            temporaryPassword, // Send the unhashed password
            studentData.fullName
          );
          emailSent = true;
          logger.info(`Credentials email sent automatically to: ${studentData.email}`);
        } catch (emailError) {
          logger.error('Failed to send credentials email automatically:', emailError);
          // Continue even if email fails
        }
      }
      
      // Return student with credentials
      res.status(201).json({
        message: emailSent 
          ? 'Student created successfully and credentials sent to email'
          : 'Student created successfully. Please save the credentials.',
        emailSent,
        student: student.toJSON(),
        credentials: {
          email: studentData.email,
          password: temporaryPassword, // Return the unhashed password for display
          studentId: studentId,
          name: studentData.fullName
        }
      });
    } catch (error) {
      logger.error('Create student error:', error);
      logger.error('Error stack:', error.stack);
      
      // If student creation fails, try to clean up the user
      if (user && user.id) {
        try {
          await User.destroy({ where: { id: user.id } });
          logger.info('Cleaned up user after error:', user.id);
        } catch (cleanupError) {
          logger.error('Cleanup error:', cleanupError);
        }
      }
      
      // If room was updated but student creation failed, decrement the occupancy
      if (student && student.roomId) {
        try {
          await Room.decrement('currentOccupancy', {
            where: { id: student.roomId }
          });
          logger.info('Reverted room occupancy for room:', student.roomId);
        } catch (roomError) {
          logger.error('Room cleanup error:', roomError);
        }
      }
      
      res.status(500).json({ 
        message: error.message || 'Failed to create student',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  async updateStudent(req, res) {
    try {
      const student = await Student.findByPk(req.params.id);
      
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
      
      // Handle room change
      if (req.body.roomId !== undefined && req.body.roomId !== student.roomId) {
        // Decrease occupancy in old room
        if (student.roomId) {
          await Room.decrement('currentOccupancy', {
            where: { id: student.roomId }
          });
          logger.info('Decreased occupancy for old room:', student.roomId);
        }
        
        // Increase occupancy in new room
        if (req.body.roomId && req.body.roomId !== '') {
          const newRoom = await Room.findByPk(req.body.roomId);
          if (!newRoom) {
            return res.status(400).json({ message: 'Selected room not found' });
          }
          if (newRoom.currentOccupancy >= newRoom.capacity) {
            // Restore old room occupancy if new room is full
            if (student.roomId) {
              await Room.increment('currentOccupancy', {
                where: { id: student.roomId }
              });
            }
            return res.status(400).json({ message: 'New room is full' });
          }
          await newRoom.increment('currentOccupancy');
          logger.info('Increased occupancy for new room:', req.body.roomId);
        }
      }
      
      // Format dates if they exist
      const updateData = { ...req.body };
      if (updateData.dateOfBirth) {
        updateData.dateOfBirth = new Date(updateData.dateOfBirth);
      }
      if (updateData.admissionDate) {
        updateData.admissionDate = new Date(updateData.admissionDate);
      }
      
      // Handle empty roomId
      if (updateData.roomId === '') {
        updateData.roomId = null;
      }
      
      // Parse custom rent amount if provided
      if (updateData.customRentAmount !== undefined) {
        updateData.customRentAmount = updateData.customRentAmount ? 
          parseFloat(updateData.customRentAmount) : null;
      }
      
      await student.update(updateData);
      
      // Fetch updated student with room details
      const updatedStudent = await Student.findByPk(student.id, {
        include: [{ model: Room, as: 'room' }]
      });
      
      res.json({
        message: 'Student updated successfully',
        student: updatedStudent
      });
    } catch (error) {
      logger.error('Update student error:', error);
      res.status(500).json({ 
        message: 'Failed to update student',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  async deleteStudent(req, res) {
    try {
      const student = await Student.findByPk(req.params.id);
      
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
      
      // Update room occupancy
      if (student.roomId) {
        await Room.decrement('currentOccupancy', {
          where: { id: student.roomId }
        });
        logger.info('Decreased room occupancy for room:', student.roomId);
      }
      
      // Soft delete - just update status
      await student.update({ status: 'vacated' });
      
      // Also deactivate the user account
      await User.update(
        { isActive: false },
        { where: { id: student.userId } }
      );
      
      logger.info('Student deleted successfully:', student.id);
      
      res.json({ message: 'Student deleted successfully' });
    } catch (error) {
      logger.error('Delete student error:', error);
      res.status(500).json({ message: 'Failed to delete student' });
    }
  }
  
  async uploadDocument(req, res) {
    try {
      const student = await Student.findByPk(req.params.id);
      
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
      
      const documents = student.documents || [];
      documents.push({
        name: req.file.originalname,
        url: `/uploads/${req.file.filename}`,
        uploadedAt: new Date()
      });
      
      await student.update({ documents });
      
      res.json({
        message: 'Document uploaded successfully',
        document: documents[documents.length - 1]
      });
    } catch (error) {
      logger.error('Upload document error:', error);
      res.status(500).json({ message: 'Failed to upload document' });
    }
  }
  
  // Generate temporary password
  generateTemporaryPassword() {
    const length = 10;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }
  
  // Send credentials to student (manual trigger from frontend)
  async sendCredentials(req, res) {
    try {
      const { email, studentId, password, name } = req.body;
      
      // Check if email service is configured
      if (!emailService || !emailService.isServiceConfigured || !emailService.isServiceConfigured()) {
        logger.warn('Email service is not configured');
        return res.status(400).json({ 
          message: 'Email service is not configured. Please configure email settings.' 
        });
      }
      
      try {
        await emailService.sendStudentCredentials(
          email,
          studentId,
          password,
          name
        );
        
        logger.info(`Credentials sent successfully to: ${email}`);
        
        res.json({ 
          message: 'Credentials sent successfully to student email' 
        });
      } catch (emailError) {
        logger.error('Failed to send credentials email:', emailError);
        res.status(500).json({ 
          message: 'Failed to send email. Please check email configuration.' 
        });
      }
    } catch (error) {
      logger.error('Send credentials error:', error);
      res.status(500).json({ 
        message: 'Failed to send credentials' 
      });
    }
  }
}

module.exports = new StudentController();