import { Character, Origin } from "../../models";
import { Op } from "sequelize";

export const characterResolvers = {
  Query: {
    characters: async (
      _: any,
      args: {
        name?: string;
        status?: string;
        species?: string;
        gender?: string;
        origin_id?: number;
        limit?: number;
        offset?: number;
      }
    ) => {
      const {
        name,
        status,
        species,
        gender,
        origin_id,
        limit = 20,
        offset = 0,
      } = args;

      const whereClause: any = {};

      // Build search conditions
      if (name) {
        whereClause.name = {
          [Op.iLike]: `%${name}%`,
        };
      }

      if (status) {
        whereClause["status"] = status;
      }

      if (species) {
        whereClause["species"] = species;
      }

      if (gender) {
        whereClause["gender"] = gender;
      }

      if (origin_id) {
        whereClause["origin_id"] = origin_id;
      }

      const characters = await Character.findAll({
        where: whereClause,
        include: [
          {
            model: Origin,
            as: "origin",
            required: false,
          },
        ],
        limit,
        offset,
        order: [["name", "ASC"]],
      });

      return characters;
    },

    character: async (_: any, { id }: { id: number }) => {
      const character = await Character.findByPk(id, {
        include: [
          {
            model: Origin,
            as: "origin",
            required: false,
          },
        ],
      });

      return character;
    },

    characterByApiId: async (_: any, { api_id }: { api_id: number }) => {
      const character = await Character.findOne({
        where: { api_id },
        include: [
          {
            model: Origin,
            as: "origin",
            required: false,
          },
        ],
      });

      return character;
    },
  },
};
