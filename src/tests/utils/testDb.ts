import { Sequelize, QueryTypes } from "sequelize";
import { Character, Origin } from "../../models";

// Don't initialize testSequelize here - do it after DB creation
let testSequelize: Sequelize | null = null;

const testOrigins = [
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
    origin_id: 1,
  },
  {
    api_id: 2,
    name: "Morty Smith",
    status: "Alive",
    species: "Human",
    gender: "Male",
    origin_id: 1,
  },
  {
    api_id: 3,
    name: "Summer Smith",
    status: "Alive",
    species: "Human",
    gender: "Female",
    origin_id: 1,
  },
  {
    api_id: 4,
    name: "Jerry Smith",
    status: "Alive",
    species: "Human",
    gender: "Male",
    origin_id: 1,
  },
  {
    api_id: 5,
    name: "Beth Smith",
    status: "Alive",
    species: "Human",
    gender: "Female",
    origin_id: 1,
  },
  {
    api_id: 6,
    name: "Birdperson",
    status: "Dead",
    species: "Bird-Person",
    gender: "Male",
    origin_id: 2,
  },
  {
    api_id: 7,
    name: "Squanchy",
    status: "Unknown",
    species: "Cat-Person",
    gender: "Male",
    origin_id: 3,
  },
  {
    api_id: 8,
    name: "Mr. Meeseeks",
    status: "Unknown",
    species: "Meeseeks",
    gender: "Male",
    origin_id: 2,
  },
];

/**
 * Create the test database if it doesn't exist
 */
async function createTestDatabase(): Promise<void> {
  const dbName = process.env.DB_NAME_TEST || "rick_and_morty_test";

  const adminSequelize = new Sequelize({
    dialect: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    database: "postgres",
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "password",
    logging: false,
  });

  try {
    await adminSequelize.authenticate();
    console.log("Connected to PostgreSQL server");

    // Use parameterized query to avoid SQL injection
    const result = await adminSequelize.query(
      "SELECT 1 FROM pg_database WHERE datname = :dbName",
      {
        replacements: { dbName },
        type: QueryTypes.SELECT,
      }
    );

    if (result.length === 0) {
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
 * Initialize test sequelize connection
 */
function initializeTestSequelize(): Sequelize {
  if (testSequelize) {
    return testSequelize;
  }

  testSequelize = new Sequelize({
    dialect: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    database: process.env.DB_NAME_TEST || "rick_and_morty_test",
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "password",
    logging: false,
  });

  return testSequelize;
}

/**
 * Initialize the test database
 * This should be called in beforeAll hooks
 */
export async function initializeTestDb(): Promise<void> {
  await createTestDatabase();

  const sequelize = initializeTestSequelize();

  // Test the connection
  try {
    await sequelize.authenticate();
    console.log("Test database connection established");
  } catch (error) {
    console.error("Failed to connect to test database:", error);
    throw error;
  }

  try {
    await sequelize.sync({ force: true });
    console.log("Test database synchronized");
  } catch (error) {
    console.error("Error syncing test database:", error);
    throw error;
  }
}

/**
 * Seed test data
 * This should be called in beforeEach hooks
 */
export async function seedTestData(): Promise<void> {
  const sequelize = initializeTestSequelize();

  try {
    await Origin.bulkCreate(testOrigins);
    await Character.bulkCreate(testCharacters);
    console.log("Test data seeded successfully");
  } catch (error) {
    console.error("Error seeding test data:", error);
    throw error;
  }
}

/**
 * Clear all test data
 * This should be called in afterEach hooks
 */
export async function clearTestData(): Promise<void> {
  const sequelize = initializeTestSequelize();

  try {
    // Disable foreign key constraints temporarily
    await sequelize.query("SET session_replication_role = 'replica'");
    
    // Truncate child table first (characters references origins)
    await sequelize.query("TRUNCATE TABLE characters RESTART IDENTITY CASCADE");
    // Then truncate parent table
    await sequelize.query("TRUNCATE TABLE origins RESTART IDENTITY CASCADE");
    
    // Re-enable foreign key constraints
    await sequelize.query("SET session_replication_role = 'origin'");
    
    console.log("Test data cleared");
  } catch (error) {
    console.error("Error clearing test data:", error);
    throw error;
  }
}

/**
 * Drop the test database
 */
export async function dropTestDatabase(): Promise<void> {
  const dbName = process.env.DB_NAME_TEST || "rick_and_morty_test";

  const adminSequelize = new Sequelize({
    dialect: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    database: "postgres",
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
  if (testSequelize) {
    await testSequelize.close();
    testSequelize = null;
    console.log("Test database connection closed");
  }
}

/**
 * Get the test sequelize instance
 */
export function getTestSequelize(): Sequelize {
  if (!testSequelize) {
    throw new Error(
      "Test database not initialized. Call initializeTestDb() first."
    );
  }
  return testSequelize;
}