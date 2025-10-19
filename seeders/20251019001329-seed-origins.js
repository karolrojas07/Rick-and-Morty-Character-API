'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const origins = [
      { api_id: 1, name: 'Earth (C-137)', createdAt: new Date(), updatedAt: new Date() },
      { api_id: 2, name: 'Abadango', createdAt: new Date(), updatedAt: new Date() },
      { api_id: 20, name: 'Earth (Replacement Dimension)', createdAt: new Date(), updatedAt: new Date() },
      { api_id: null, name: 'unknown', createdAt: new Date(), updatedAt: new Date() },
    ];

    await queryInterface.bulkInsert('origins', origins);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('origins', null, {});
  }
};