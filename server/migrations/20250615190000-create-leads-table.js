'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('leads', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true
      },
      leadTypeId: {
        type: Sequelize.UUID,
        allowNull: false
      },
      facebookLeadId: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      facebookAdId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      facebookCampaignId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING
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
      propertyType: {
        type: Sequelize.ENUM('house', 'apartment', 'commercial', 'other')
      },
      propertyAge: {
        type: Sequelize.INTEGER
      },
      propertySize: {
        type: Sequelize.INTEGER
      },
      energyLabel: {
        type: Sequelize.ENUM('A', 'B', 'C', 'D', 'E', 'F', 'G', 'unknown')
      },
      currentHeatingSystem: {
        type: Sequelize.STRING
      },
      interestIn: {
        type: Sequelize.JSON
      },
      budget: {
        type: Sequelize.STRING
      },
      naamKlant: {
        type: Sequelize.STRING
      },
      datumInteresse: {
        type: Sequelize.STRING
      },
      postcode: {
        type: Sequelize.STRING
      },
      plaatsnaam: {
        type: Sequelize.STRING
      },
      telefoonnummer: {
        type: Sequelize.STRING
      },
      zonnepanelen: {
        type: Sequelize.STRING
      },
      dynamischContract: {
        type: Sequelize.STRING
      },
      stroomverbruik: {
        type: Sequelize.STRING
      },
      redenThuisbatterij: {
        type: Sequelize.STRING
      },
      timeline: {
        type: Sequelize.ENUM('immediate', 'within_3_months', 'within_6_months', 'within_year', 'unknown')
      },
      additionalInfo: {
        type: Sequelize.TEXT
      },
      leadQuality: {
        type: Sequelize.ENUM('high', 'medium', 'low'),
        defaultValue: 'medium'
      },
      cost: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: false,
        defaultValue: 0
      },
      status: {
        type: Sequelize.ENUM('new', 'distributed', 'contacted', 'converted', 'lost'),
        defaultValue: 'new'
      },
      distributionCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      lastDistributedAt: {
        type: Sequelize.DATE
      },
      rawData: {
        type: Sequelize.JSON
      },
      sheetTabName: {
        type: Sequelize.STRING
      },
      sheetCustomerName: {
        type: Sequelize.STRING
      },
      sheetBranche: {
        type: Sequelize.STRING
      },
      sheetLocation: {
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
    await queryInterface.dropTable('leads');
  }
}; 