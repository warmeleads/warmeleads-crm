'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('leads', 'facebookAdId');
    await queryInterface.removeColumn('leads', 'facebookCampaignId');
    await queryInterface.removeColumn('leads', 'firstName');
    await queryInterface.removeColumn('leads', 'lastName');
    await queryInterface.removeColumn('leads', 'city');
    await queryInterface.removeColumn('leads', 'country');
    await queryInterface.removeColumn('leads', 'latitude');
    await queryInterface.removeColumn('leads', 'longitude');
  },
  async down (queryInterface, Sequelize) {
    // Niet terugdraaien, want deze velden zijn niet meer nodig
  }
}; 