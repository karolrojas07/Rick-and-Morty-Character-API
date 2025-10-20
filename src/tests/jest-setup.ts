// Load environment variables for testing
import dotenv from "dotenv";

// Load test environment variables
dotenv.config({ path: ".env" });

// Set default test environment variables if not provided
process.env["DB_NAME_TEST"] =
  process.env["DB_NAME_TEST"] || "rick_and_morty_test";
process.env["DB_HOST"] = process.env["DB_HOST"] || "localhost";
process.env["DB_PORT"] = process.env["DB_PORT"] || "5432";
process.env["DB_USERNAME"] = process.env["DB_USERNAME"] || "postgres";
process.env["DB_PASSWORD"] = process.env["DB_PASSWORD"] || "password";
