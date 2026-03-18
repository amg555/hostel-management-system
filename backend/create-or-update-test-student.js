require('dotenv').config();
const { sequelize } = require('./src/config/database');
const { User, Student, Room } = require('./src/models');
const bcrypt = require('bcryptjs');
const logger = require('./src/utils/logger');

async function createOrUpdateTestStudent() {
  try {
    console.log('🔄 Starting test student setup...\n');
    
    const testEmail = '123naveena123@gmail.com';
    const testPassword = 'password123';
    const testStudentData = {
      fullName: 'Naveena Test',
      phone: '9876543210',
      rollNumber: 'TEST2024001',
      gender: 'female',
      course: 'B.Tech',
      department: 'Computer Science',
      academicYear: '2024',
      status: 'active'
    };

    // Check if user exists
    let user = await User.findOne({ where: { email: testEmail } });
    
    if (user) {
      console.log('✓ User exists, updating password and ensuring it\'s a student...');
      
      // Update the user to ensure correct password and role
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      await user.update({
        password: hashedPassword,
        role: 'student',
        isActive: true,
        requirePasswordChange: false
      });
      
      console.log('✓ User updated successfully');
    } else {
      console.log('Creating new user...');
      
      // Hash the password before creating
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      
      user = await User.create({
        email: testEmail,
        password: hashedPassword,
        role: 'student',
        isActive: true,
        requirePasswordChange: false
      });
      
      console.log('✓ User created successfully');
    }

    // Check if student profile exists
    let student = await Student.findOne({ where: { userId: user.id } });
    
    if (student) {
      console.log('✓ Student profile exists, updating...');
      
      await student.update({
        ...testStudentData,
        email: testEmail
      });
      
      console.log('✓ Student profile updated');
    } else {
      console.log('Creating student profile...');
      
      // Generate student ID
      const year = new Date().getFullYear();
      const count = await Student.count() + 1;
      const studentId = `STU${year}${count.toString().padStart(4, '0')}`;
      
      student = await Student.create({
        userId: user.id,
        studentId: studentId,
        ...testStudentData,
        email: testEmail
      });
      
      console.log('✓ Student profile created with ID:', studentId);
    }

    // Verify the password works
    console.log('\n🔐 Verifying credentials...');
    const verifyUser = await User.findOne({ where: { email: testEmail } });
    const isPasswordValid = await bcrypt.compare(testPassword, verifyUser.password);
    
    if (isPasswordValid) {
      console.log('✅ Password verification successful!');
    } else {
      console.log('❌ Password verification failed!');
    }

    console.log('\n📋 Test Student Details:');
    console.log('------------------------');
    console.log('Email:', testEmail);
    console.log('Password:', testPassword);
    console.log('Role:', user.role);
    console.log('Active:', user.isActive);
    console.log('Student ID:', student.studentId);
    console.log('Full Name:', student.fullName);
    console.log('------------------------');
    
    console.log('\n✅ Test student setup completed successfully!');
    console.log('You can now login with:');
    console.log(`  Email: ${testEmail}`);
    console.log(`  Password: ${testPassword}`);
    
  } catch (error) {
    console.error('❌ Error setting up test student:', error);
    console.error('Error details:', error.message);
  } finally {
    await sequelize.close();
  }
}

// Run the setup
createOrUpdateTestStudent();