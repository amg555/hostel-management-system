const { User, Student } = require('./src/models');
const bcrypt = require('bcryptjs');

async function checkUsers() {
  try {
    console.log('Checking all users in database...\n');
    
    // Get all users
    const users = await User.findAll({
      attributes: ['id', 'email', 'role', 'isActive', 'requirePasswordChange', 'createdAt']
    });
    
    console.log(`Total users found: ${users.length}\n`);
    
    // Display each user
    for (const user of users) {
      console.log('-------------------');
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log(`Active: ${user.isActive}`);
      console.log(`Requires Password Change: ${user.requirePasswordChange}`);
      console.log(`Created: ${user.createdAt}`);
      
      // If student, get student details
      if (user.role === 'student') {
        const student = await Student.findOne({
          where: { userId: user.id }
        });
        if (student) {
          console.log(`Student ID: ${student.studentId}`);
          console.log(`Student Name: ${student.fullName}`);
        }
      }
    }
    
    console.log('\n-------------------');
    console.log('\nChecking specific email: 123naveena123@gmail.com');
    
    const specificUser = await User.findOne({
      where: { email: '123naveena123@gmail.com' }
    });
    
    if (specificUser) {
      console.log('User found!');
      console.log('Role:', specificUser.role);
      console.log('Active:', specificUser.isActive);
    } else {
      console.log('User NOT found with this email');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUsers();