import { DataTypes, Model, Optional, Sequelize } from "sequelize";

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

export function defineOrigin(sequelize: Sequelize) {
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

  return Origin;
}

export default defineOrigin;
