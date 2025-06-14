'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('customers', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' }
      },
      companyName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      contactPerson: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false
      },
      phone: {
        type: Sequelize.STRING
      },
      address: {
        type: Sequelize.TEXT
      },
      city: {
        type: Sequelize.STRING,
        allowNull: false
      },
      postalCode: {
        type: Sequelize.STRING
      },
      country: {
        type: Sequelize.ENUM('Netherlands', 'Belgium'),
        allowNull: false
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: false
      },
      longitude: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: false
      },
      serviceRadius: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 60
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      budget: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      budgetUsed: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      },
      targetLeadsPerMonth: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      currentMonthLeads: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      costPerLead: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: false
      },
      googleSheetId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      googleSheetName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      priority: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      notes: {
        type: Sequelize.TEXT
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
    await queryInterface.dropTable('customers');
  }
}; 