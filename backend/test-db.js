// backend/test-db.js
require('dotenv').config();
const { sequelize } = require('./src/models');

async function testConnection() {
  try {
    console.log('Testing database connection...');
    console.log('Database URL:', process.env.DATABASE_URL ? 'Found' : 'Not found');
    console.log('Node Environment:', process.env.NODE_ENV || 'development');
    
    await sequelize.authenticate();
    console.log('✅ Connection has been established successfully.');
    
    // Get database dialect
    console.log('Database Dialect:', sequelize.getDialect());
    
    // Get database name
    console.log('Database Name:', sequelize.getDatabaseName());
    
    await sequelize.close();
    console.log('Connection closed successfully');
    
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  }
}

testConnection();