'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    try {
      console.log('🚀 Start force removal of enum constraints...');
      
      // Force remove enum constraints and convert all columns to STRING
      const columnsToFix = [
        'budget',
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

      for (const column of columnsToFix) {
        try {
          // Force drop the column if it exists (this removes any constraints)
          await queryInterface.removeColumn('leads', column);
          console.log(`✅ Dropped column: ${column}`);
        } catch (error) {
          console.log(`Column ${column} doesn't exist or already dropped:`, error.message);
        }
        
        // Re-add as STRING without any constraints
        await queryInterface.addColumn('leads', column, {
          type: Sequelize.STRING,
          allowNull: true
        });
        console.log(`✅ Re-added ${column} as STRING`);
      }
      
      console.log('🎉 All enum constraints removed and columns converted to STRING!');
      
    } catch (error) {
      console.error('❌ Migration error:', error);
      throw error;
    }
  },

  async down (queryInterface, Sequelize) {
    console.log('⚠️ This migration cannot be reverted - it removes enum constraints permanently');
  }
}; 