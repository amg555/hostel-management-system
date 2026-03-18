require('dotenv').config();
const { User } = require('../src/models');
const bcrypt = require('bcryptjs');

const createAdminUser = async () => {
  try {
    // Check if admin exists
    const adminExists = await User.findOne({ 
      where: { email: 'admin@hostel.com' } 
    });

    if (!adminExists) {
      await User.create({
        email: 'admin@hostel.com',
        password: 'admin123', // Will be hashed by the hook
        role: 'admin',
        isActive: true
      });
      console.log('Admin user created successfully');
      console.log('Email: admin@hostel.com');
      console.log('Password: admin123');
    } else {
      console.log('Admin user already exists');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser();