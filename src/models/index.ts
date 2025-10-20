import defaultSequelize from "../config/sequelize";
import { Sequelize } from "sequelize";
import { Origin, defineOrigin } from "./origin";
import { Character, defineCharacter } from "./character";

export function initModels(sequelize?: Sequelize) {
	const seq = sequelize ?? defaultSequelize;

	// Define models on the provided sequelize instance
	defineOrigin(seq);
	defineCharacter(seq);

	// Define associations if they aren't already defined
	if (!Character.associations || !('origin' in Character.associations)) {
		Character.belongsTo(Origin, { foreignKey: "origin_id", as: "origin" });
	}

	if (!Origin.associations || !('characters' in Origin.associations)) {
		Origin.hasMany(Character, { foreignKey: "origin_id", as: "characters" });
	}

	return { Character, Origin };
}

// Initialize with default sequelize so app code importing models continues to work
initModels();

export { defaultSequelize as sequelize };
export { Character, Origin };
export default initModels;
