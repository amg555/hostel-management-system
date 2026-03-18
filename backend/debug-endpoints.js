require('dotenv').config();
const { sequelize, User, Student, Room, Payment, Notice, Complaint } = require('./src/models');

async function testEndpoints() {
  try {
    console.log('Testing database connection...');
    await sequelize.authenticate();
    console.log('✓ Database connected');

    // Test 1: Find a student user
    console.log('\nFinding student user...');
    const user = await User.findOne({ 
      where: { email: '123naveena123@gmail.com' } 
    });
    console.log('User found:', user ? 'Yes' : 'No');
    if (user) {
      console.log('User ID:', user.id);
      console.log('User Role:', user.role);
    }

    // Test 2: Find student profile
    if (user) {
      console.log('\nFinding student profile...');
      const student = await Student.findOne({ 
        where: { userId: user.id } 
      });
      console.log('Student found:', student ? 'Yes' : 'No');
      if (student) {
        console.log('Student ID:', student.id);
        console.log('Student Name:', student.fullName);
      }
    }

    // Test 3: Check if tables exist
    console.log('\nChecking tables...');
    const tables = await sequelize.getQueryInterface().showAllTables();
    console.log('Tables in database:', tables);

    // Test 4: Check Notice table
    console.log('\nChecking notices...');
    const noticeCount = await Notice.count();
    console.log('Notice count:', noticeCount);

    // Test 5: Check Payment table
    console.log('\nChecking payments...');
    const paymentCount = await Payment.count();
    console.log('Payment count:', paymentCount);

  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

testEndpoints();