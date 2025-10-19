import { Options } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const config: { [key: string]: Options } = {
  development: {
    username: process.env["DB_USERNAME"] || "postgres",
    password: process.env["DB_PASSWORD"] || "password",
    database: process.env["DB_NAME"] || "rick_and_morty_dev",
    host: process.env["DB_HOST"] || "localhost",
    port: parseInt(process.env["DB_PORT"] || "5432"),
    dialect: "postgres",
    logging: console.log,
  },
  test: {
    username: process.env["DB_USERNAME"] || "postgres",
    password: process.env["DB_PASSWORD"] || "password",
    database: process.env["DB_NAME_TEST"] || "rick_and_morty_test",
    host: process.env["DB_HOST"] || "localhost",
    port: parseInt(process.env["DB_PORT"] || "5432"),
    dialect: "postgres",
    logging: false,
  },
  production: {
    username: process.env["DB_USERNAME"],
    password: process.env["DB_PASSWORD"],
    database: process.env["DB_NAME"],
    host: process.env["DB_HOST"],
    port: parseInt(process.env["DB_PORT"] || "5432"),
    dialect: "postgres",
    logging: false,
  },
};

export = config;
