'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Controleer en voeg kolommen toe als ze nog niet bestaan
    const tableDescription = await queryInterface.describeTable('leads');
    
    if (!tableDescription.sheetTabName) {
      await queryInterface.addColumn('leads', 'sheetTabName', { type: Sequelize.STRING });
    }
    
    if (!tableDescription.sheetCustomerName) {
      await queryInterface.addColumn('leads', 'sheetCustomerName', { type: Sequelize.STRING });
    }
    
    if (!tableDescription.sheetBranche) {
      await queryInterface.addColumn('leads', 'sheetBranche', { type: Sequelize.STRING });
    }
    
    if (!tableDescription.sheetLocation) {
      await queryInterface.addColumn('leads', 'sheetLocation', { type: Sequelize.STRING });
    }
  },

  async down (queryInterface, Sequelize) {
    // Verwijder kolommen als ze bestaan
    const tableDescription = await queryInterface.describeTable('leads');
    
    if (tableDescription.sheetTabName) {
      await queryInterface.removeColumn('leads', 'sheetTabName');
    }
    
    if (tableDescription.sheetCustomerName) {
      await queryInterface.removeColumn('leads', 'sheetCustomerName');
    }
    
    if (tableDescription.sheetBranche) {
      await queryInterface.removeColumn('leads', 'sheetBranche');
    }
    
    if (tableDescription.sheetLocation) {
      await queryInterface.removeColumn('leads', 'sheetLocation');
    }
  }
};
