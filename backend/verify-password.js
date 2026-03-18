require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize } = require('./src/config/database');
const { User } = require('./src/models');

async function verifyPassword() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connected successfully');

    const email = process.argv[2] || '123naveena123@gmail.com';
    const password = process.argv[3] || 'password123';

    console.log(`Verifying password for: ${email}`);

    // Find the user
    const user = await User.findOne({ where: { email } });

    if (!user) {
      console.error('❌ User not found with email:', email);
      process.exit(1);
    }

    console.log('User found:', {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      requirePasswordChange: user.requirePasswordChange
    });

    console.log('Stored password hash:', user.password);
    console.log('Password to verify:', password);

    // Test password comparison
    const isValid = await user.comparePassword(password);
    console.log('Password valid:', isValid);

    // Also test with bcrypt directly
    const directComparison = await bcrypt.compare(password, user.password);
    console.log('Direct bcrypt comparison:', directComparison);

    if (isValid) {
      console.log('✅ Password verification successful!');
    } else {
      console.log('❌ Password verification failed!');
      
      // Try to reset the password
      console.log('\nResetting password...');
      user.password = password;
      await user.save();
      
      const newCheck = await user.comparePassword(password);
      console.log('After reset, password valid:', newCheck);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

verifyPassword();