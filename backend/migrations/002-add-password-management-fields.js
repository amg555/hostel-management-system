'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add resetToken column
    await queryInterface.addColumn('users', 'resetToken', {
      type: Sequelize.STRING,
      allowNull: true
    });

    // Add resetTokenExpiry column
    await queryInterface.addColumn('users', 'resetTokenExpiry', {
      type: Sequelize.DATE,
      allowNull: true
    });

    // Add requirePasswordChange column
    await queryInterface.addColumn('users', 'requirePasswordChange', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'resetToken');
    await queryInterface.removeColumn('users', 'resetTokenExpiry');
    await queryInterface.removeColumn('users', 'requirePasswordChange');
  }
};