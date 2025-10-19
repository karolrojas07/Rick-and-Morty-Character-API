'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First, get the origin IDs by api_id
    const origins = await queryInterface.sequelize.query(
      'SELECT id, api_id FROM origins',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const originMap = {};
    origins.forEach(origin => {
      if (origin.api_id === null) {
        originMap['unknown'] = origin.id;
      } else {
        originMap[origin.api_id] = origin.id;
      }
    });

    const characters = [
      {
        api_id: 1,
        status: 'Alive',
        species: 'Human',
        gender: 'Male',
        name: 'Rick Sanchez',
        origin_id: originMap[1],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        api_id: 2,
        status: 'Alive',
        species: 'Human',
        gender: 'Male',
        name: 'Morty Smith',
        origin_id: originMap['unknown'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        api_id: 3,
        status: 'Alive',
        species: 'Human',
        gender: 'Female',
        name: 'Summer Smith',
        origin_id: originMap[20],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        api_id: 4,
        status: 'Alive',
        species: 'Human',
        gender: 'Female',
        name: 'Beth Smith',
        origin_id: originMap[20],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        api_id: 5,
        status: 'Alive',
        species: 'Human',
        gender: 'Male',
        name: 'Jerry Smith',
        origin_id: originMap[20],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        api_id: 6,
        status: 'Alive',
        species: 'Alien',
        gender: 'Female',
        name: 'Abadango Cluster Princess',
        origin_id: originMap[2],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        api_id: 7,
        status: 'unknown',
        species: 'Human',
        gender: 'Male',
        name: 'Abradolf Lincler',
        origin_id: originMap[20],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        api_id: 8,
        status: 'Dead',
        species: 'Human',
        gender: 'Male',
        name: 'Adjudicator Rick',
        origin_id: originMap['unknown'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        api_id: 9,
        status: 'Dead',
        species: 'Human',
        gender: 'Male',
        name: 'Agency Director',
        origin_id: originMap[20],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        api_id: 10,
        status: 'Dead',
        species: 'Human',
        gender: 'Male',
        name: 'Alan Rails',
        origin_id: originMap['unknown'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        api_id: 11,
        status: 'Dead',
        species: 'Human',
        gender: 'Male',
        name: 'Albert Einstein',
        origin_id: originMap[1],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        api_id: 12,
        status: 'Dead',
        species: 'Human',
        gender: 'Male',
        name: 'Alexander',
        origin_id: originMap[1],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        api_id: 13,
        status: 'unknown',
        species: 'Alien',
        gender: 'unknown',
        name: 'Alien Googah',
        origin_id: originMap['unknown'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        api_id: 14,
        status: 'unknown',
        species: 'Alien',
        gender: 'Male',
        name: 'Alien Morty',
        origin_id: originMap['unknown'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        api_id: 15,
        status: 'unknown',
        species: 'Alien',
        gender: 'Male',
        name: 'Alien Rick',
        origin_id: originMap['unknown'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('characters', characters);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('characters', null, {});
  }
};