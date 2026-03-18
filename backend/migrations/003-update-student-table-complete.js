'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First, check if the table exists
    const tableExists = await queryInterface.showAllTables()
      .then(tables => tables.includes('students'));
    
    if (!tableExists) {
      // Create the students table if it doesn't exist
      await queryInterface.createTable('students', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true
        },
        userId: {
          type: Sequelize.UUID,
          allowNull: false,
          unique: true,
          references: {
            model: 'users',
            key: 'id'
          },
          onDelete: 'CASCADE'
        },
        studentId: {
          type: Sequelize.STRING,
          unique: true,
          allowNull: false
        },
        fullName: {
          type: Sequelize.STRING,
          allowNull: false
        },
        rollNumber: {
          type: Sequelize.STRING,
          unique: true
        },
        email: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },
        phone: {
          type: Sequelize.STRING,
          allowNull: false
        },
        alternatePhone: {
          type: Sequelize.STRING
        },
        dateOfBirth: {
          type: Sequelize.DATEONLY
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
        bloodGroup: {
          type: Sequelize.STRING
        },
        collegeName: {
          type: Sequelize.STRING
        },
        course: {
          type: Sequelize.STRING
        },
        department: {
          type: Sequelize.STRING
        },
        academicYear: {
          type: Sequelize.STRING
        },
        roomId: {
          type: Sequelize.UUID,
          references: {
            model: 'rooms',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        admissionDate: {
          type: Sequelize.DATEONLY
        },
        status: {
          type: Sequelize.ENUM('active', 'inactive', 'pending', 'vacated'),
          defaultValue: 'active'
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        }
      });
    } else {
      // Get existing table structure
      const tableInfo = await queryInterface.describeTable('students');
      
      // Add missing columns
      const columnsToAdd = {
        studentId: Sequelize.STRING,
        fullName: Sequelize.STRING,
        rollNumber: Sequelize.STRING,
        alternatePhone: Sequelize.STRING,
        dateOfBirth: Sequelize.DATEONLY,
        gender: Sequelize.ENUM('male', 'female', 'other'),
        permanentAddress: Sequelize.TEXT,
        currentAddress: Sequelize.TEXT,
        guardianName: Sequelize.STRING,
        guardianPhone: Sequelize.STRING,
        guardianRelation: Sequelize.STRING,
        collegeName: Sequelize.STRING,
        department: Sequelize.STRING,
        academicYear: Sequelize.STRING,
        admissionDate: Sequelize.DATEONLY
      };

      for (const [columnName, columnType] of Object.entries(columnsToAdd)) {
        if (!tableInfo[columnName]) {
          await queryInterface.addColumn('students', columnName, {
            type: columnType,
            allowNull: true
          });
        }
      }

      // Handle special cases for existing columns that might have wrong names
      if (tableInfo.firstName && !tableInfo.fullName) {
        // If firstName exists but fullName doesn't, add fullName and migrate data
        await queryInterface.addColumn('students', 'fullName', {
          type: Sequelize.STRING,
          allowNull: true
        });
        
        // Combine firstName and lastName into fullName
        await queryInterface.sequelize.query(`
          UPDATE students 
          SET "fullName" = CONCAT("firstName", ' ', COALESCE("lastName", ''))
          WHERE "fullName" IS NULL
        `);
      }

      // Handle phone column rename if needed
      if (tableInfo.phoneNumber && !tableInfo.phone) {
        await queryInterface.renameColumn('students', 'phoneNumber', 'phone');
      }

      // Handle parent to guardian rename if needed
      if (tableInfo.parentName && !tableInfo.guardianName) {
        await queryInterface.renameColumn('students', 'parentName', 'guardianName');
      }
      if (tableInfo.parentPhone && !tableInfo.guardianPhone) {
        await queryInterface.renameColumn('students', 'parentPhone', 'guardianPhone');
      }

      // Update status enum to include all values
      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_students_status" ADD VALUE IF NOT EXISTS 'pending';
        ALTER TYPE "enum_students_status" ADD VALUE IF NOT EXISTS 'vacated';
      `).catch(() => {
        // Ignore if enum values already exist
      });
    }

    // Add indexes for better performance
    await queryInterface.addIndex('students', ['email'], {
      unique: true,
      name: 'students_email_unique'
    }).catch(() => {});

    await queryInterface.addIndex('students', ['studentId'], {
      unique: true,
      name: 'students_studentId_unique'
    }).catch(() => {});

    await queryInterface.addIndex('students', ['rollNumber'], {
      unique: true,
      name: 'students_rollNumber_unique'
    }).catch(() => {});

    await queryInterface.addIndex('students', ['roomId'], {
      name: 'students_roomId_index'
    }).catch(() => {});
  },

  down: async (queryInterface, Sequelize) => {
    // Remove added columns
    const columnsToRemove = [
      'studentId', 'fullName', 'rollNumber', 'alternatePhone',
      'dateOfBirth', 'gender', 'permanentAddress', 'currentAddress',
      'guardianName', 'guardianPhone', 'guardianRelation',
      'collegeName', 'department', 'academicYear', 'admissionDate'
    ];

    for (const column of columnsToRemove) {
      await queryInterface.removeColumn('students', column).catch(() => {});
    }
  }
};