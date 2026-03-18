'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('students', 'customRentAmount', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Custom rent amount for this student, overrides room rent if set'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('students', 'customRentAmount');
  }
};