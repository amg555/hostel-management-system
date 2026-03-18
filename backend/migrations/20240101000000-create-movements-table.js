'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if table already exists
    const tableExists = await queryInterface.sequelize.query(
      "SHOW TABLES LIKE 'movements'",
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (tableExists.length > 0) {
      console.log('Movements table already exists, skipping creation');
      return;
    }

    await queryInterface.createTable('movements', {
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
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      type: {
        type: Sequelize.ENUM('check_out', 'check_in'),
        allowNull: false
      },
      reason: {
        type: Sequelize.STRING,
        allowNull: false
      },
      checkOutTime: {
        type: Sequelize.DATE,
        allowNull: true
      },
      expectedReturnTime: {
        type: Sequelize.DATE,
        allowNull: true
      },
      checkInTime: {
        type: Sequelize.DATE,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected', 'completed'),
        defaultValue: 'pending'
      },
      approvedBy: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      remarks: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('movements', ['studentId']);
    await queryInterface.addIndex('movements', ['type']);
    await queryInterface.addIndex('movements', ['status']);
    await queryInterface.addIndex('movements', ['createdAt']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('movements');
  }
};