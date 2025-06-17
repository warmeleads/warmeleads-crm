'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    console.log('🚀 Start database reset en branch_columns setup...');
    
    // 1. Verwijder alle leads (database reset)
    await queryInterface.bulkDelete('leads', null, {});
    console.log('✅ Alle leads verwijderd');
    
    // 2. Maak branch_columns tabel aan
    await queryInterface.createTable('branch_columns', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      branch: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      columns: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: 'Array van kolom objecten: [{key: "naamKlant", label: "Naam klant", order: 1}]'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });
    
    console.log('✅ branch_columns tabel aangemaakt');
    
    // 3. Voeg standaard kolommen toe voor Thuisbatterij
    await queryInterface.bulkInsert('branch_columns', [{
      id: Sequelize.UUIDV4(),
      branch: 'Thuisbatterij',
      columns: JSON.stringify([
        { key: 'naamKlant', label: 'Naam klant', order: 1 },
        { key: 'datumInteresse', label: 'Datum interesse klant', order: 2 },
        { key: 'postcode', label: 'Postcode', order: 3 },
        { key: 'plaatsnaam', label: 'Plaatsnaam', order: 4 },
        { key: 'telefoonnummer', label: 'Telefoonnummer', order: 5 },
        { key: 'email', label: 'E-mail', order: 6 },
        { key: 'zonnepanelen', label: 'Zonnepanelen', order: 7 },
        { key: 'dynamischContract', label: 'Dynamisch contract', order: 8 },
        { key: 'stroomverbruik', label: 'Stroomverbruik', order: 9 },
        { key: 'budget', label: 'Budget', order: 10 },
        { key: 'redenThuisbatterij', label: 'Reden Thuisbatterij', order: 11 }
      ]),
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
    
    console.log('✅ Standaard Thuisbatterij kolommen toegevoegd');
    
    // 4. Maak leads tabel opnieuw aan met alleen basis velden
    await queryInterface.dropTable('leads');
    await queryInterface.createTable('leads', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      leadTypeId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'lead_types',
          key: 'id'
        }
      },
      facebookLeadId: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      rawData: {
        type: Sequelize.JSON,
        comment: 'Complete sheet data'
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
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });
    
    console.log('✅ Leads tabel opnieuw aangemaakt met alleen basis velden');
  },

  async down (queryInterface, Sequelize) {
    // Niet terugdraaien - dit is een reset migratie
    console.log('⚠️  Deze migratie kan niet worden teruggedraaid (database reset)');
  }
}; 