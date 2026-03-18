require('dotenv').config();
const { sequelize } = require('./src/config/database');
const { User, Student } = require('./src/models');
const bcrypt = require('bcryptjs');

async function verifyStudentLogin() {
  try {
    console.log('🔍 Verifying student login credentials...\n');
    
    const testEmail = '123naveena123@gmail.com';
    const testPassword = 'password123';
    
    // Find the user
    const user = await User.findOne({ where: { email: testEmail } });
    
    if (!user) {
      console.log('❌ User not found with email:', testEmail);
      console.log('\nRun: node create-or-update-test-student.js');
      return;
    }
    
    console.log('✓ User found');
    console.log('  Email:', user.email);
    console.log('  Role:', user.role);
    console.log('  Active:', user.isActive);
    console.log('  Requires Password Change:', user.requirePasswordChange);
    
    // Check student profile
    const student = await Student.findOne({ where: { userId: user.id } });
    
    if (!student) {
      console.log('❌ Student profile not found');
      console.log('\nRun: node create-or-update-test-student.js');
      return;
    }
    
    console.log('\n✓ Student profile found');
    console.log('  Student ID:', student.studentId);
    console.log('  Full Name:', student.fullName);
    console.log('  Status:', student.status);
    
    // Test password
    console.log('\n🔐 Testing password...');
    const isValid = await bcrypt.compare(testPassword, user.password);
    
    if (isValid) {
      console.log('✅ Password is valid!');
      
      // Test the instance method
      const instanceValid = await user.comparePassword(testPassword);
      console.log('✅ Instance method validation:', instanceValid);
      
      console.log('\n✨ Login credentials are working correctly!');
      console.log('You should be able to login with:');
      console.log(`  Email: ${testEmail}`);
      console.log(`  Password: ${testPassword}`);
    } else {
      console.log('❌ Password is invalid');
      console.log('Password hash in database:', user.password.substring(0, 20) + '...');
      console.log('\nRun: node create-or-update-test-student.js');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

verifyStudentLogin();