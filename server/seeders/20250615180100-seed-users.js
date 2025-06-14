'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up (queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('admin1234', 12);
    await queryInterface.bulkInsert('users', [
      {
        id: Sequelize.literal('gen_random_uuid()'),
        email: 'admin@warmeleads.nl',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true,
        lastLogin: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', { email: 'admin@warmeleads.nl' }, {});
  }
}; 