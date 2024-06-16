'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Seed data for the role table
    await queryInterface.bulkInsert('role', [
      { id: 1, name: 'customer' },
      { id: 2, name: 'admin' },
      { id: 3, name: 'dentist' },
      { id: 4, name: 'clinic owner' },
    ]);
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
