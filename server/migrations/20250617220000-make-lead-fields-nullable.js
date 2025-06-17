'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('leads', 'facebookAdId', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.changeColumn('leads', 'facebookCampaignId', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.changeColumn('leads', 'firstName', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.changeColumn('leads', 'lastName', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.changeColumn('leads', 'city', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.changeColumn('leads', 'country', { type: Sequelize.ENUM('Netherlands', 'Belgium'), allowNull: true });
    await queryInterface.changeColumn('leads', 'latitude', { type: Sequelize.DECIMAL(10, 8), allowNull: true });
    await queryInterface.changeColumn('leads', 'longitude', { type: Sequelize.DECIMAL(11, 8), allowNull: true });
  },
  async down (queryInterface, Sequelize) {
    // Niet terugdraaien, want dit is gewenst gedrag
  }
}; 