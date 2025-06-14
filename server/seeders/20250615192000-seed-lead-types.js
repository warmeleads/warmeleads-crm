'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('lead_types', [
      {
        id: Sequelize.literal('gen_random_uuid()'),
        name: 'thuisbatterij',
        displayName: 'Thuisbatterij',
        description: 'Leads voor thuisbatterijen',
        category: 'storage',
        averageCost: 25.00,
        conversionRate: 0.07,
        averageValue: 1200.00,
        isActive: true,
        priority: 1,
        targetKeywords: JSON.stringify(['batterij', 'thuisbatterij', 'accu', 'opslag']),
        facebookFormId: null,
        googleSheetTemplate: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        name: 'zonnepanelen',
        displayName: 'Zonnepanelen',
        description: 'Leads voor zonnepanelen',
        category: 'energy',
        averageCost: 20.00,
        conversionRate: 0.09,
        averageValue: 800.00,
        isActive: true,
        priority: 2,
        targetKeywords: JSON.stringify(['zonnepaneel', 'zonnepanelen', 'pv']),
        facebookFormId: null,
        googleSheetTemplate: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        name: 'airco',
        displayName: 'Airco',
        description: 'Leads voor airconditioning',
        category: 'cooling',
        averageCost: 18.00,
        conversionRate: 0.08,
        averageValue: 950.00,
        isActive: true,
        priority: 3,
        targetKeywords: JSON.stringify(['airco', 'koelen', 'airconditioning']),
        facebookFormId: null,
        googleSheetTemplate: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('lead_types', null, {});
  }
}; 