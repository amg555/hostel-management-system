require('dotenv').config();
const { sequelize } = require('./src/config/database');
const { User } = require('./src/models');

async function resetStudentPassword() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connected successfully');

    // Get email from command line argument or use default
    const email = process.argv[2] || '123naveena123@gmail.com';
    const newPassword = process.argv[3] || 'password123';

    console.log(`Resetting password for: ${email}`);

    // Find the user
    const user = await User.findOne({ where: { email } });

    if (!user) {
      console.error('❌ User not found with email:', email);
      process.exit(1);
    }

    // Update the password (the beforeUpdate hook will hash it)
    user.password = newPassword;
    user.isActive = true;
    user.requirePasswordChange = false;
    await user.save();

    console.log('✅ Password reset successfully!');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 New Password: ${newPassword}`);
    console.log('\nYou can now login with these credentials.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting password:', error);
    process.exit(1);
  }
}

resetStudentPassword();