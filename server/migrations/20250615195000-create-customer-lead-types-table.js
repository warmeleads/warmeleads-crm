'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('customer_lead_types', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true
      },
      customerId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'customers', key: 'id' }
      },
      leadTypeId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'lead_types', key: 'id' }
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      targetLeadsPerMonth: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      currentMonthLeads: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      costPerLead: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: false
      },
      priority: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      maxDistance: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 60
      },
      qualityThreshold: {
        type: Sequelize.ENUM('high', 'medium', 'low'),
        defaultValue: 'medium'
      },
      budget: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      budgetUsed: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
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
    // Indexes
    await queryInterface.addIndex('customer_lead_types', ['customerId', 'leadTypeId'], { unique: true });
    await queryInterface.addIndex('customer_lead_types', ['isActive']);
    await queryInterface.addIndex('customer_lead_types', ['priority']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('customer_lead_types');
  }
}; 