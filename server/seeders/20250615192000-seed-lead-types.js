'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    const leadTypes = [
      {
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
        googleSheetTemplate: null
      },
      {
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
        googleSheetTemplate: null
      },
      {
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
        googleSheetTemplate: null
      }
    ];

    for (const leadType of leadTypes) {
      // Check of deze leadType al bestaat
      const [existing] = await queryInterface.sequelize.query(
        'SELECT id FROM lead_types WHERE name = :name',
        { replacements: { name: leadType.name }, type: Sequelize.QueryTypes.SELECT }
      );
      if (!existing) {
        await queryInterface.bulkInsert('lead_types', [{
          ...leadType,
          id: Sequelize.literal('gen_random_uuid()'),
          createdAt: new Date(),
          updatedAt: new Date()
        }]);
      }
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('lead_types', {
      name: ['thuisbatterij', 'zonnepanelen', 'airco']
    }, {});
  }
}; 