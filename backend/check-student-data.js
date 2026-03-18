const { User, Student, Room } = require('./src/models');

async function checkStudentData() {
  try {
    console.log('Checking student data...\n');
    
    // Find the user
    const user = await User.findOne({
      where: { email: '123naveena123@gmail.com' }
    });
    
    if (!user) {
      console.log('❌ User not found with email: 123naveena123@gmail.com');
      return;
    }
    
    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      role: user.role
    });
    
    // Find the student record
    const student = await Student.findOne({
      where: { userId: user.id },
      include: [{
        model: Room,
        as: 'room'
      }]
    });
    
    if (!student) {
      console.log('❌ Student record not found for userId:', user.id);
      console.log('\nCreating student record...');
      
      // Create student record
      const newStudent = await Student.create({
        userId: user.id,
        studentId: 'STU2024001',
        fullName: 'Naveena',
        email: '123naveena123@gmail.com',
        phone: '1234567890',
        gender: 'female',
        permanentAddress: 'Test Address',
        currentAddress: 'Test Address',
        guardianName: 'Guardian Name',
        guardianPhone: '9876543210',
        status: 'active',
        admissionDate: new Date()
      });
      
      console.log('✅ Student record created:', newStudent.id);
    } else {
      console.log('✅ Student found:', {
        id: student.id,
        studentId: student.studentId,
        fullName: student.fullName,
        roomId: student.roomId,
        room: student.room ? student.room.roomNumber : 'No room assigned'
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkStudentData();