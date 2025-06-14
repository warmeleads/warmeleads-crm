'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('lead_types', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      displayName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT
      },
      category: {
        type: Sequelize.ENUM('energy', 'heating', 'cooling', 'storage', 'other'),
        allowNull: false
      },
      averageCost: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: false,
        defaultValue: 0
      },
      conversionRate: {
        type: Sequelize.DECIMAL(5, 4),
        allowNull: false,
        defaultValue: 0.05
      },
      averageValue: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      priority: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      targetKeywords: {
        type: Sequelize.JSON
      },
      facebookFormId: {
        type: Sequelize.STRING
      },
      googleSheetTemplate: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('lead_types');
  }
}; 