// backend/reset-db.js
require('dotenv').config();
const { sequelize } = require('./src/models');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function resetDatabase() {
  try {
    console.log('⚠️  WARNING: This will DROP ALL TABLES and recreate them!');
    console.log('⚠️  All existing data will be PERMANENTLY DELETED!');
    console.log('');
    
    // Ask for confirmation
    const answer = await new Promise((resolve) => {
      rl.question('Are you sure you want to continue? Type "yes" to confirm: ', resolve);
    });
    
    if (answer.toLowerCase() !== 'yes') {
      console.log('❌ Database reset cancelled');
      rl.close();
      process.exit(0);
    }
    
    console.log('\nResetting database...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    // Force sync - this will drop all tables and recreate them
    await sequelize.sync({ force: true });
    console.log('✅ All tables dropped and recreated');
    
    console.log('\n✅ Database reset completed!');
    console.log('Run "npm run sync-db" to add sample data');
    
  } catch (error) {
    console.error('❌ Database reset failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  } finally {
    rl.close();
    await sequelize.close();
    console.log('Database connection closed');
  }
}

// Run the reset
resetDatabase();