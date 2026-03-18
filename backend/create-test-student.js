require('dotenv').config();
const { sequelize } = require('./src/config/database');
const { User, Student, Room } = require('./src/models');

async function createTestStudent() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connected successfully');

    // The email and password for testing
    const testEmail = '123naveena123@gmail.com';
    const testPassword = 'password123'; // Change this to your desired password

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email: testEmail } });
    
    if (existingUser) {
      console.log('User already exists. Updating password...');
      
      // Update the password (the beforeUpdate hook will hash it)
      existingUser.password = testPassword;
      existingUser.isActive = true;
      existingUser.requirePasswordChange = false;
      await existingUser.save();
      
      console.log('✅ Password updated successfully!');
    } else {
      // Create new user (the beforeCreate hook will hash the password)
      const user = await User.create({
        email: testEmail,
        password: testPassword,
        role: 'student',
        isActive: true,
        requirePasswordChange: false
      });
      
      console.log('User created with ID:', user.id);

      // Generate student ID
      const year = new Date().getFullYear();
      const count = await Student.count() + 1;
      const studentId = `STU${year}${count.toString().padStart(4, '0')}`;

      // Create or find a test room
      const [room] = await Room.findOrCreate({
        where: { roomNumber: '101' },
        defaults: {
          roomNumber: '101',
          capacity: 4,
          currentOccupancy: 1,
          floor: 1,
          type: 'standard',
          status: 'available',
          monthlyRent: 5000
        }
      });

      // Create student profile
      await Student.create({
        userId: user.id,
        studentId: studentId,
        fullName: 'Naveena Test',
        email: testEmail,
        phone: '1234567890',
        rollNumber: 'ROLL001',
        course: 'Computer Science',
        year: '2',
        department: 'Engineering',
        parentName: 'Parent Name',
        parentPhone: '0987654321',
        address: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        roomId: room.id,
        admissionDate: new Date(),
        status: 'active'
      });

      console.log('✅ Test student created successfully!');
    }

    console.log('\n📧 Email:', testEmail);
    console.log('🔑 Password:', testPassword);
    console.log('\nYou can now login with these credentials.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createTestStudent();