'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    try {
      // First, let's check if the budget column exists and what type it is
      const tableDescription = await queryInterface.describeTable('leads');
      
      if (tableDescription.budget) {
        console.log('Budget column exists, checking if it needs to be converted from enum...');
        
        // If budget is an enum, we need to convert it to string
        // This is a more robust approach that handles the enum constraint
        await queryInterface.changeColumn('leads', 'budget', {
          type: Sequelize.STRING,
          allowNull: true
        });
        
        console.log('Successfully converted budget column to STRING type');
      } else {
        // If budget doesn't exist, add it
        await queryInterface.addColumn('leads', 'budget', {
          type: Sequelize.STRING,
          allowNull: true
        });
        console.log('Added budget column as STRING type');
      }
      
      // Also ensure all other fixed columns exist as strings
      const fixedColumns = [
        'naamKlant',
        'datumInteresse', 
        'postcode',
        'plaatsnaam',
        'telefoonnummer',
        'email',
        'zonnepanelen',
        'dynamischContract',
        'stroomverbruik',
        'redenThuisbatterij'
      ];
      
      for (const column of fixedColumns) {
        if (!tableDescription[column]) {
          await queryInterface.addColumn('leads', column, {
            type: Sequelize.STRING,
            allowNull: true
          });
          console.log(`Added ${column} column as STRING type`);
        } else {
          // Convert existing columns to string if they're not already
          await queryInterface.changeColumn('leads', column, {
            type: Sequelize.STRING,
            allowNull: true
          });
          console.log(`Converted ${column} column to STRING type`);
        }
      }
      
    } catch (error) {
      console.error('Migration error:', error);
      throw error;
    }
  },

  async down (queryInterface, Sequelize) {
    // We don't want to revert this migration as it fixes a critical issue
    console.log('This migration cannot be reverted as it fixes a critical enum issue');
  }
}; 