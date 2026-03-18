require('dotenv').config();
const { sequelize } = require('./src/models');
const logger = require('./src/utils/logger');

async function safeSync() {
  try {
    console.log('Starting safe sync...');
    
    // Only sync models without dropping tables
    await sequelize.sync({ alter: true });
    
    console.log('Database synced successfully');
    
    // Create sample notice if none exist
    const { Notice } = require('./src/models');
    const noticeCount = await Notice.count();
    
    if (noticeCount === 0) {
      await Notice.create({
        title: 'Welcome to Hostel Management System',
        content: 'This is a test notice. The system is now operational.',
        category: 'general',
        priority: 'medium',
        targetAudience: 'all',
        isActive: true,
        createdBy: 'system'
      });
      console.log('Sample notice created');
    }
    
  } catch (error) {
    console.error('Sync error:', error);
  } finally {
    await sequelize.close();
  }
}

safeSync();