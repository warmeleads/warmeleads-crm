'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    // Zoek een bestaande userId (admin)
    const [user] = await queryInterface.sequelize.query(
      "SELECT id FROM users LIMIT 1",
      { type: Sequelize.QueryTypes.SELECT }
    );
    if (!user) throw new Error('Geen user gevonden om als eigenaar van de klant te gebruiken.');
    await queryInterface.bulkInsert('customers', [
      {
        id: Sequelize.literal('gen_random_uuid()'),
        userId: user.id,
        companyName: 'Testbedrijf BV',
        contactPerson: 'Jan Test',
        email: 'test@bedrijf.nl',
        phone: '0612345678',
        address: 'Teststraat 1',
        city: 'Amsterdam',
        postalCode: '1000AA',
        country: 'Netherlands',
        latitude: 52.370216,
        longitude: 4.895168,
        serviceRadius: 60,
        isActive: true,
        budget: 1000.00,
        budgetUsed: 0,
        targetLeadsPerMonth: 10,
        currentMonthLeads: 0,
        costPerLead: 25.00,
        googleSheetId: 'TESTSHEETID',
        googleSheetName: 'Leads',
        priority: 1,
        notes: 'Testklant voor development',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('customers', { email: 'test@bedrijf.nl' }, {});
  }
}; 