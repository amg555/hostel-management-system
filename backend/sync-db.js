// backend/sync-db.js
require('dotenv').config();
const { sequelize, User, Student, Room, Payment, Complaint, Notice, Movement, Expense } = require('./src/models');
const bcrypt = require('bcryptjs');

async function syncDatabase() {
  try {
    console.log('Starting database sync...');
    console.log('Database URL:', process.env.DATABASE_URL ? 'Connected' : 'Not found');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    
    // Sync all models with the database
    // Use alter: true to update existing tables without dropping them
    // Use force: true only if you want to drop and recreate all tables
    await sequelize.sync({ alter: true });
    console.log('✅ All models synced successfully');
    
    // List all synced tables
    const models = [
      'User', 'Student', 'Room', 'Payment', 
      'Complaint', 'Notice', 'Movement', 'Expense'
    ];
    console.log('📋 Synced models:', models.join(', '));
    
    // Check if admin user exists
    const adminCount = await User.count({
      where: { email: 'admin@hostel.com' }
    });
    
    if (adminCount === 0) {
      console.log('Creating default admin user...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const adminUser = await User.create({
        email: 'admin@hostel.com',
        password: hashedPassword,
        role: 'admin',
        isActive: true
      });
      
      console.log('✅ Admin user created successfully');
      console.log('   Email: admin@hostel.com');
      console.log('   Password: admin123');
      console.log('   Role: admin');
    } else {
      console.log('ℹ️  Admin user already exists');
    }
    
    // Check if sample student user exists
    const studentCount = await User.count({
      where: { email: 'student@hostel.com' }
    });
    
    if (studentCount === 0) {
      console.log('Creating sample student user...');
      const hashedPassword = await bcrypt.hash('student123', 10);
      
      const studentUser = await User.create({
        email: 'student@hostel.com',
        password: hashedPassword,
        role: 'student',
        isActive: true
      });
      
      // Create student profile
      await Student.create({
        userId: studentUser.id,
        registrationNumber: 'STU001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'student@hostel.com',
        phone: '1234567890',
        course: 'Computer Science',
        year: 2,
        parentName: 'Parent Name',
        parentPhone: '0987654321',
        address: '123 Main St, City',
        bloodGroup: 'O+',
        status: 'active'
      });
      
      console.log('✅ Sample student user created successfully');
      console.log('   Email: student@hostel.com');
      console.log('   Password: student123');
      console.log('   Role: student');
    } else {
      console.log('ℹ️  Sample student user already exists');
    }
    
    // Create sample rooms if none exist
    const roomCount = await Room.count();
    
    if (roomCount === 0) {
      console.log('Creating sample rooms...');
      
      const sampleRooms = [
        { roomNumber: '101', floor: 1, capacity: 2, type: 'double', price: 5000, status: 'available' },
        { roomNumber: '102', floor: 1, capacity: 2, type: 'double', price: 5000, status: 'available' },
        { roomNumber: '103', floor: 1, capacity: 1, type: 'single', price: 7000, status: 'available' },
        { roomNumber: '201', floor: 2, capacity: 3, type: 'triple', price: 4000, status: 'available' },
        { roomNumber: '202', floor: 2, capacity: 2, type: 'double', price: 5000, status: 'available' },
      ];
      
      for (const room of sampleRooms) {
        await Room.create({
          ...room,
          occupied: 0,
          facilities: ['WiFi', 'AC', 'Attached Bathroom']
        });
      }
      
      console.log('✅ Sample rooms created successfully');
    } else {
      console.log('ℹ️  Rooms already exist in database');
    }
    
    // Display database statistics
    console.log('\n📊 Database Statistics:');
    console.log(`   Total Users: ${await User.count()}`);
    console.log(`   Total Students: ${await Student.count()}`);
    console.log(`   Total Rooms: ${await Room.count()}`);
    console.log(`   Total Payments: ${await Payment.count()}`);
    console.log(`   Total Complaints: ${await Complaint.count()}`);
    console.log(`   Total Notices: ${await Notice.count()}`);
    console.log(`   Total Movements: ${await Movement.count()}`);
    console.log(`   Total Expenses: ${await Expense.count()}`);
    
    console.log('\n✅ Database sync completed successfully!');
    
  } catch (error) {
    console.error('❌ Database sync failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('Database connection closed');
  }
}

// Run the sync
syncDatabase();