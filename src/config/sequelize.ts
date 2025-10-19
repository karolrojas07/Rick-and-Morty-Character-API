import { Sequelize, Options } from "sequelize";
import config from "./database";

const environment = process.env["NODE_ENV"] ?? "development";
const sequelize = new Sequelize(
  config[environment as keyof typeof config] as Options
);

export default sequelize;
