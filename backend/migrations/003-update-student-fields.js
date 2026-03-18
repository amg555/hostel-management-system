'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('students');
    
    // Add missing columns if they don't exist
    const columnsToAdd = {
      studentId: {
        type: Sequelize.STRING,
        unique: true
      },
      fullName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      rollNumber: {
        type: Sequelize.STRING,
        unique: true
      },
      alternatePhone: {
        type: Sequelize.STRING
      },
      dateOfBirth: {
        type: Sequelize.DATE
      },
      gender: {
        type: Sequelize.ENUM('male', 'female', 'other')
      },
      permanentAddress: {
        type: Sequelize.TEXT
      },
      currentAddress: {
        type: Sequelize.TEXT
      },
      guardianName: {
        type: Sequelize.STRING
      },
      guardianPhone: {
        type: Sequelize.STRING
      },
      guardianRelation: {
        type: Sequelize.STRING
      },
      collegeName: {
        type: Sequelize.STRING
      },
      department: {
        type: Sequelize.STRING
      },
      academicYear: {
        type: Sequelize.STRING
      },
      admissionDate: {
        type: Sequelize.DATE
      }
    };

    for (const [columnName, columnDef] of Object.entries(columnsToAdd)) {
      if (!tableInfo[columnName]) {
        await queryInterface.addColumn('students', columnName, columnDef);
      }
    }

    // Update status enum to include 'pending' and 'vacated'
    if (tableInfo.status) {
      await queryInterface.changeColumn('students', 'status', {
        type: Sequelize.ENUM('active', 'inactive', 'pending', 'vacated'),
        defaultValue: 'active'
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Revert changes if needed
  }
};