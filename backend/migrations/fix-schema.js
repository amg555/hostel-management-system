module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Check if complaints table exists
      const tables = await queryInterface.showAllTables();
      
      if (!tables.includes('complaints')) {
        await queryInterface.createTable('complaints', {
          id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true
          },
          studentId: {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
              model: 'students',
              key: 'id'
            }
          },
          title: {
            type: Sequelize.STRING,
            allowNull: false
          },
          description: {
            type: Sequelize.TEXT,
            allowNull: false
          },
          category: {
            type: Sequelize.ENUM('maintenance', 'security', 'cleanliness', 'noise', 'other'),
            defaultValue: 'other'
          },
          status: {
            type: Sequelize.ENUM('pending', 'in_progress', 'resolved', 'closed'),
            defaultValue: 'pending'
          },
          priority: {
            type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'),
            defaultValue: 'medium'
          },
          resolvedAt: {
            type: Sequelize.DATE
          },
          resolution: {
            type: Sequelize.TEXT
          },
          assignedTo: {
            type: Sequelize.STRING
          },
          createdAt: {
            type: Sequelize.DATE,
            allowNull: false
          },
          updatedAt: {
            type: Sequelize.DATE,
            allowNull: false
          }
        });
      }

      // Add missing columns to payments table if needed
      const paymentColumns = await queryInterface.describeTable('payments');
      
      if (!paymentColumns.monthYear) {
        await queryInterface.addColumn('payments', 'monthYear', {
          type: Sequelize.STRING
        });
      }
      
      if (!paymentColumns.paymentDate) {
        await queryInterface.addColumn('payments', 'paymentDate', {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW
        });
      }

      // Add missing columns to notices table if needed
      const noticeColumns = await queryInterface.describeTable('notices');
      
      if (!noticeColumns.priority) {
        await queryInterface.addColumn('notices', 'priority', {
          type: Sequelize.ENUM('low', 'medium', 'high'),
          defaultValue: 'medium'
        });
      }
      
      if (!noticeColumns.validFrom) {
        await queryInterface.addColumn('notices', 'validFrom', {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW
        });
      }

      console.log('Schema fixed successfully');
    } catch (error) {
      console.error('Migration error:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Implement rollback if needed
  }
};