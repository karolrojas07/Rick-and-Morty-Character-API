import { Sequelize, QueryTypes } from "sequelize";
import { Character, Origin } from "../../models";

// Create a test database connection
const testSequelize = new Sequelize({
  dialect: "postgres",
  host: process.env["DB_HOST"] || "localhost",
  port: parseInt(process.env["DB_PORT"] || "5432"),
  database: process.env["DB_NAME_TEST"] || "rick_and_morty_test",
  username: process.env["DB_USERNAME"] || "postgres",
  password: process.env["DB_PASSWORD"] || "password",
  logging: false, // Disable SQL logging during tests
});

// Test data
export const testOrigins = [
  {
    api_id: 1,
    name: "Earth C-137",
  },
  {
    api_id: 2,
    name: "Unknown",
  },
  {
    api_id: 3,
    name: "Citadel of Ricks",
  },
];

export const testCharacters = [
  {
    api_id: 1,
    name: "Rick Sanchez",
    status: "Alive",
    species: "Human",
    gender: "Male",
    origin_id: 1, // Earth C-137
  },
  {
    api_id: 2,
    name: "Morty Smith",
    status: "Alive",
    species: "Human",
    gender: "Male",
    origin_id: 1, // Earth C-137
  },
  {
    api_id: 3,
    name: "Summer Smith",
    status: "Alive",
    species: "Human",
    gender: "Female",
    origin_id: 1, // Earth C-137
  },
  {
    api_id: 4,
    name: "Jerry Smith",
    status: "Alive",
    species: "Human",
    gender: "Male",
    origin_id: 1, // Earth C-137
  },
  {
    api_id: 5,
    name: "Beth Smith",
    status: "Alive",
    species: "Human",
    gender: "Female",
    origin_id: 1, // Earth C-137
  },
  {
    api_id: 6,
    name: "Birdperson",
    status: "Dead",
    species: "Bird-Person",
    gender: "Male",
    origin_id: 2, // Unknown
  },
  {
    api_id: 7,
    name: "Squanchy",
    status: "Unknown",
    species: "Cat-Person",
    gender: "Male",
    origin_id: 3, // Citadel of Ricks
  },
  {
    api_id: 8,
    name: "Mr. Meeseeks",
    status: "Unknown",
    species: "Meeseeks",
    gender: "Male",
    origin_id: 2, // Unknown
  },
];

/**
 * Create the test database if it doesn't exist
 */
export async function createTestDatabase(): Promise<void> {
  const dbName = process.env["DB_NAME_TEST"] || "rick_and_morty_test";

  // Connect to PostgreSQL without specifying a database
  const adminSequelize = new Sequelize({
    dialect: "postgres",
    host: process.env["DB_HOST"] || "localhost",
    port: parseInt(process.env["DB_PORT"] || "5432"),
    database: "postgres", // Connect to default postgres database
    username: process.env["DB_USERNAME"] || "postgres",
    password: process.env["DB_PASSWORD"] || "password",
    logging: false,
  });

  try {
    // Check if database exists
    const result = await adminSequelize.query(
      `SELECT 1 FROM pg_database WHERE datname = '${dbName}'`,
      { type: QueryTypes.SELECT }
    );

    // Create database if it doesn't exist
    if (result.length == 0) {
      await adminSequelize.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Test database '${dbName}' created successfully`);
    } else {
      console.log(`Test database '${dbName}' already exists`);
    }
  } catch (error) {
    console.error("Error creating test database:", error);
    throw error;
  } finally {
    await adminSequelize.close();
  }
}

/**
 * Initialize the test database
 * This should be called in beforeAll hooks
 */
export async function initializeTestDb(): Promise<void> {
  // Create the test database first
  await createTestDatabase();

  // Sync the database
  await testSequelize.sync({ force: true });
}

/**
 * Seed test data
 * This should be called in beforeEach hooks
 */
export async function seedTestData(): Promise<void> {
  // Create origins first
  await Origin.bulkCreate(testOrigins);

  // Create characters
  await Character.bulkCreate(testCharacters);
}

/**
 * Clear all test data
 * This should be called in afterEach hooks
 */
export async function clearTestData(): Promise<void> {
  await Character.destroy({ where: {}, force: true });
  await Origin.destroy({ where: {}, force: true });
}

/**
 * Drop the test database (optional cleanup)
 */
export async function dropTestDatabase(): Promise<void> {
  const dbName = process.env.DB_NAME_TEST || "rick_and_morty_test";

  // Connect to PostgreSQL without specifying a database
  const adminSequelize = new Sequelize({
    dialect: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    database: "postgres", // Connect to default postgres database
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "password",
    logging: false,
  });

  try {
    await adminSequelize.query(`DROP DATABASE IF EXISTS "${dbName}"`);
    console.log(`Test database '${dbName}' dropped successfully`);
  } catch (error) {
    console.error("Error dropping test database:", error);
    throw error;
  } finally {
    await adminSequelize.close();
  }
}

/**
 * Close the test database connection
 * This should be called in afterAll hooks
 */
export async function closeTestDb(): Promise<void> {
  await testSequelize.close();
}

/**
 * Get the test sequelize instance
 * Use this in tests when you need direct database access
 */
export function getTestSequelize(): Sequelize {
  return testSequelize;
}
