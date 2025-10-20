import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/sequelize";
import { Origin } from "./origin";

interface CharacterAttributes {
  id: number;
  api_id: number;
  status: string;
  species: string;
  gender: string;
  name: string;
  origin_id: number;
}

interface CharacterCreationAttributes
  extends Optional<CharacterAttributes, "id"> {}

export class Character
  extends Model<CharacterAttributes, CharacterCreationAttributes>
  implements CharacterAttributes
{
  public id!: number;
  public api_id!: number;
  public status!: string;
  public species!: string;
  public gender!: string;
  public name!: string;
  public origin_id!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public origin?: Origin;
}

Character.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    api_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    species: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    gender: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    origin_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Origin,
        key: "id",
      },
    },
  },
  {
    sequelize,
    tableName: "characters",
    timestamps: true,
  }
);

// Define associations
Character.belongsTo(Origin, { foreignKey: "origin_id", as: "origin" });
Origin.hasMany(Character, { foreignKey: "origin_id", as: "characters" });
