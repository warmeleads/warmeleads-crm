'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    // Haal alle customers en lead_types op
    const customers = await queryInterface.sequelize.query(
      'SELECT id FROM customers',
      { type: Sequelize.QueryTypes.SELECT }
    );
    const leadTypes = await queryInterface.sequelize.query(
      'SELECT id, averageCost FROM lead_types',
      { type: Sequelize.QueryTypes.SELECT }
    );
    for (const customer of customers) {
      for (const leadType of leadTypes) {
        // Bestaat deze combinatie al?
        const [existing] = await queryInterface.sequelize.query(
          'SELECT id FROM customer_lead_types WHERE "customerId" = :customerId AND "leadTypeId" = :leadTypeId',
          { replacements: { customerId: customer.id, leadTypeId: leadType.id }, type: Sequelize.QueryTypes.SELECT }
        );
        if (!existing) {
          await queryInterface.bulkInsert('customer_lead_types', [{
            id: Sequelize.literal('gen_random_uuid()'),
            customerId: customer.id,
            leadTypeId: leadType.id,
            isActive: true,
            targetLeadsPerMonth: 10,
            currentMonthLeads: 0,
            costPerLead: leadType.averageCost || 25.00,
            priority: 1,
            maxDistance: 60,
            qualityThreshold: 'medium',
            budget: 1000.00,
            budgetUsed: 0,
            createdAt: new Date(),
            updatedAt: new Date()
          }]);
        }
      }
    }
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('customer_lead_types', null, {});
  }
}; 