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

    // MIGRATIE: wijzig budget (en andere vaste kolommen) naar STRING als ze ENUM zijn
    if (tableDescription.budget && tableDescription.budget.type.startsWith('ENUM')) {
      await queryInterface.changeColumn('leads', 'budget', { type: Sequelize.STRING });
    }
    if (!tableDescription.naamKlant) {
      await queryInterface.addColumn('leads', 'naamKlant', { type: Sequelize.STRING });
    }
    if (!tableDescription.datumInteresse) {
      await queryInterface.addColumn('leads', 'datumInteresse', { type: Sequelize.STRING });
    }
    if (!tableDescription.postcode) {
      await queryInterface.addColumn('leads', 'postcode', { type: Sequelize.STRING });
    }
    if (!tableDescription.plaatsnaam) {
      await queryInterface.addColumn('leads', 'plaatsnaam', { type: Sequelize.STRING });
    }
    if (!tableDescription.telefoonnummer) {
      await queryInterface.addColumn('leads', 'telefoonnummer', { type: Sequelize.STRING });
    }
    if (!tableDescription.zonnepanelen) {
      await queryInterface.addColumn('leads', 'zonnepanelen', { type: Sequelize.STRING });
    }
    if (!tableDescription.dynamischContract) {
      await queryInterface.addColumn('leads', 'dynamischContract', { type: Sequelize.STRING });
    }
    if (!tableDescription.stroomverbruik) {
      await queryInterface.addColumn('leads', 'stroomverbruik', { type: Sequelize.STRING });
    }
    if (!tableDescription.redenThuisbatterij) {
      await queryInterface.addColumn('leads', 'redenThuisbatterij', { type: Sequelize.STRING });
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

    // MIGRATIE: wijzig budget (en andere vaste kolommen) naar STRING als ze ENUM zijn
    if (tableDescription.budget && tableDescription.budget.type.startsWith('ENUM')) {
      await queryInterface.changeColumn('leads', 'budget', { type: Sequelize.STRING });
    }
    if (!tableDescription.naamKlant) {
      await queryInterface.removeColumn('leads', 'naamKlant');
    }
    if (!tableDescription.datumInteresse) {
      await queryInterface.removeColumn('leads', 'datumInteresse');
    }
    if (!tableDescription.postcode) {
      await queryInterface.removeColumn('leads', 'postcode');
    }
    if (!tableDescription.plaatsnaam) {
      await queryInterface.removeColumn('leads', 'plaatsnaam');
    }
    if (!tableDescription.telefoonnummer) {
      await queryInterface.removeColumn('leads', 'telefoonnummer');
    }
    if (!tableDescription.zonnepanelen) {
      await queryInterface.removeColumn('leads', 'zonnepanelen');
    }
    if (!tableDescription.dynamischContract) {
      await queryInterface.removeColumn('leads', 'dynamischContract');
    }
    if (!tableDescription.stroomverbruik) {
      await queryInterface.removeColumn('leads', 'stroomverbruik');
    }
    if (!tableDescription.redenThuisbatterij) {
      await queryInterface.removeColumn('leads', 'redenThuisbatterij');
    }
  }
};
