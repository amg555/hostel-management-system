require('dotenv').config();
const { Sequelize } = require('sequelize');
const logger = require('./src/utils/logger');

const resetDatabase = async () => {
  try {
    console.log('🔄 Starting complete database reset...');
    
    // Create a new connection just for dropping tables
    const sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      logging: false
    });

    // Drop all tables in the correct order (reverse of dependencies)
    const dropQueries = [
      'DROP TABLE IF EXISTS movements CASCADE;',
      'DROP TABLE IF EXISTS expenses CASCADE;',
      'DROP TABLE IF EXISTS notices CASCADE;',
      'DROP TABLE IF EXISTS complaints CASCADE;',
      'DROP TABLE IF EXISTS payments CASCADE;',
      'DROP TABLE IF EXISTS students CASCADE;',
      'DROP TABLE IF EXISTS rooms CASCADE;',
      'DROP TABLE IF EXISTS users CASCADE;',
      'DROP TYPE IF EXISTS "enum_users_role" CASCADE;',
      'DROP TYPE IF EXISTS "enum_students_status" CASCADE;',
      'DROP TYPE IF EXISTS "enum_rooms_type" CASCADE;',
      'DROP TYPE IF EXISTS "enum_rooms_status" CASCADE;',
      'DROP TYPE IF EXISTS "enum_payments_paymentType" CASCADE;',
      'DROP TYPE IF EXISTS "enum_payments_paymentMethod" CASCADE;',
      'DROP TYPE IF EXISTS "enum_payments_status" CASCADE;',
      'DROP TYPE IF EXISTS "enum_complaints_category" CASCADE;',
      'DROP TYPE IF EXISTS "enum_complaints_status" CASCADE;',
      'DROP TYPE IF EXISTS "enum_complaints_priority" CASCADE;',
      'DROP TYPE IF EXISTS "enum_notices_category" CASCADE;',
      'DROP TYPE IF EXISTS "enum_notices_targetAudience" CASCADE;',
      'DROP TYPE IF EXISTS "enum_movements_type" CASCADE;',
      'DROP TYPE IF EXISTS "enum_movements_status" CASCADE;',
      'DROP TYPE IF EXISTS "enum_expenses_category" CASCADE;',
      'DROP TYPE IF EXISTS "enum_expenses_paymentMethod" CASCADE;'
    ];

    console.log('📦 Dropping all existing tables and types...');
    for (const query of dropQueries) {
      await sequelize.query(query);
    }
    console.log('✅ All tables and types dropped');

    await sequelize.close();

    // Now recreate everything with the models
    const { sequelize: modelSequelize } = require('./src/models');
    
    console.log('🔨 Creating new tables...');
    await modelSequelize.sync({ force: true });
    console.log('✅ All tables created successfully');

    // Create admin user
    const { User } = require('./src/models');
    const admin = await User.create({
      email: 'admin@hostel.com',
      password: 'admin123',
      role: 'admin',
      isActive: true
    });
    
    console.log('\n✅ Database reset complete!');
    console.log('👤 Admin user created:');
    console.log('   Email: admin@hostel.com');
    console.log('   Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  }
};

resetDatabase();