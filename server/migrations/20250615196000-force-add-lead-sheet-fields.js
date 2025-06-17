'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('leads');
    const addIfMissing = async (col, type) => {
      if (!tableDescription[col]) {
        await queryInterface.addColumn('leads', col, { type });
      }
    };
    await addIfMissing('naamKlant', Sequelize.STRING);
    await addIfMissing('datumInteresse', Sequelize.STRING);
    await addIfMissing('postcode', Sequelize.STRING);
    await addIfMissing('plaatsnaam', Sequelize.STRING);
    await addIfMissing('telefoonnummer', Sequelize.STRING);
    await addIfMissing('email', Sequelize.STRING);
    await addIfMissing('zonnepanelen', Sequelize.STRING);
    await addIfMissing('dynamischContract', Sequelize.STRING);
    await addIfMissing('stroomverbruik', Sequelize.STRING);
    await addIfMissing('budget', Sequelize.STRING);
    await addIfMissing('redenThuisbatterij', Sequelize.STRING);
  },
  async down (queryInterface, Sequelize) {
    // Optioneel: kolommen verwijderen
  }
}; 