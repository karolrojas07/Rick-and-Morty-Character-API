import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/sequelize";

interface OriginAttributes {
  id: number;
  api_id: number;
  name: string;
}

interface OriginCreationAttributes extends Optional<OriginAttributes, "id"> {}

export class Origin
  extends Model<OriginAttributes, OriginCreationAttributes>
  implements OriginAttributes
{
  public id!: number;
  public api_id!: number;
  public name!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Origin.init(
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
    name: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "origins",
    timestamps: true,
  }
);
