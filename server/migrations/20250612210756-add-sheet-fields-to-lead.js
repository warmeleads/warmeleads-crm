'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('leads', 'sheetTabName', { type: Sequelize.STRING });
    await queryInterface.addColumn('leads', 'sheetCustomerName', { type: Sequelize.STRING });
    await queryInterface.addColumn('leads', 'sheetBranche', { type: Sequelize.STRING });
    await queryInterface.addColumn('leads', 'sheetLocation', { type: Sequelize.STRING });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('leads', 'sheetTabName');
    await queryInterface.removeColumn('leads', 'sheetCustomerName');
    await queryInterface.removeColumn('leads', 'sheetBranche');
    await queryInterface.removeColumn('leads', 'sheetLocation');
  }
};
