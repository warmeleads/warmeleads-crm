'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('lead_types');
    if (!table.displayName) {
      await queryInterface.addColumn('lead_types', 'displayName', { type: Sequelize.STRING, allowNull: false, defaultValue: '' });
    }
    if (!table.description) {
      await queryInterface.addColumn('lead_types', 'description', { type: Sequelize.TEXT });
    }
    if (!table.category) {
      await queryInterface.addColumn('lead_types', 'category', { type: Sequelize.ENUM('energy', 'heating', 'cooling', 'storage', 'other'), allowNull: false, defaultValue: 'other' });
    }
    if (!table.averageCost) {
      await queryInterface.addColumn('lead_types', 'averageCost', { type: Sequelize.DECIMAL(8, 2), allowNull: false, defaultValue: 0 });
    }
    if (!table.conversionRate) {
      await queryInterface.addColumn('lead_types', 'conversionRate', { type: Sequelize.DECIMAL(5, 4), allowNull: false, defaultValue: 0.05 });
    }
    if (!table.averageValue) {
      await queryInterface.addColumn('lead_types', 'averageValue', { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 });
    }
    if (!table.isActive) {
      await queryInterface.addColumn('lead_types', 'isActive', { type: Sequelize.BOOLEAN, defaultValue: true });
    }
    if (!table.priority) {
      await queryInterface.addColumn('lead_types', 'priority', { type: Sequelize.INTEGER, defaultValue: 1 });
    }
    if (!table.targetKeywords) {
      await queryInterface.addColumn('lead_types', 'targetKeywords', { type: Sequelize.JSON });
    }
    if (!table.facebookFormId) {
      await queryInterface.addColumn('lead_types', 'facebookFormId', { type: Sequelize.STRING });
    }
    if (!table.googleSheetTemplate) {
      await queryInterface.addColumn('lead_types', 'googleSheetTemplate', { type: Sequelize.STRING });
    }
  },
  async down(queryInterface, Sequelize) {
    // Kolommen verwijderen als ze bestaan
    const table = await queryInterface.describeTable('lead_types');
    if (table.displayName) {
      await queryInterface.removeColumn('lead_types', 'displayName');
    }
    if (table.description) {
      await queryInterface.removeColumn('lead_types', 'description');
    }
    if (table.category) {
      await queryInterface.removeColumn('lead_types', 'category');
    }
    if (table.averageCost) {
      await queryInterface.removeColumn('lead_types', 'averageCost');
    }
    if (table.conversionRate) {
      await queryInterface.removeColumn('lead_types', 'conversionRate');
    }
    if (table.averageValue) {
      await queryInterface.removeColumn('lead_types', 'averageValue');
    }
    if (table.isActive) {
      await queryInterface.removeColumn('lead_types', 'isActive');
    }
    if (table.priority) {
      await queryInterface.removeColumn('lead_types', 'priority');
    }
    if (table.targetKeywords) {
      await queryInterface.removeColumn('lead_types', 'targetKeywords');
    }
    if (table.facebookFormId) {
      await queryInterface.removeColumn('lead_types', 'facebookFormId');
    }
    if (table.googleSheetTemplate) {
      await queryInterface.removeColumn('lead_types', 'googleSheetTemplate');
    }
  }
}; 