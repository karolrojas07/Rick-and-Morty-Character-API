import { Character, Origin } from "../../models";
import { Op } from "sequelize";
import { cacheService } from "../../services/cache.service";
import { LogExecutionTime } from "../../utils/decorators";

export class CharacterResolver {
  @LogExecutionTime
  async characters(
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
  ) {
    const {
      name,
      status,
      species,
      gender,
      origin_id,
      limit = 20,
      offset = 0,
    } = args;

    // Generate cache key based on all query parameters
    const cacheKey = cacheService.generateCacheKey("characters", {
      name: name || "",
      status: status || "",
      species: species || "",
      gender: gender || "",
      origin_id: origin_id || "",
      limit,
      offset,
    });

    // Try to get cached data first
    const cachedData = await cacheService.getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }

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

    // Cache the results
    await cacheService.setCachedData(cacheKey, characters);

    return characters;
  }

  @LogExecutionTime
  async character(_: any, { id }: { id: number }) {
    const cacheKey = cacheService.generateCacheKey("character", { id });

    // Try to get cached data first
    const cachedData = await cacheService.getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const character = await Character.findByPk(id, {
      include: [
        {
          model: Origin,
          as: "origin",
          required: false,
        },
      ],
    });

    // Cache the result if found
    if (character) {
      await cacheService.setCachedData(cacheKey, character);
    }

    return character;
  }

  @LogExecutionTime
  async characterByApiId(_: any, { api_id }: { api_id: number }) {
    const cacheKey = cacheService.generateCacheKey("character:api", {
      api_id,
    });

    // Try to get cached data first
    const cachedData = await cacheService.getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }

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

    // Cache the result if found
    if (character) {
      await cacheService.setCachedData(cacheKey, character);
    }

    return character;
  }
}

// Create an instance of the resolver class
const characterResolverInstance = new CharacterResolver();

// Export the resolver in the format expected by Apollo Server
export const characterResolvers = {
  Query: {
    characters: characterResolverInstance.characters.bind(
      characterResolverInstance
    ),
    character: characterResolverInstance.character.bind(
      characterResolverInstance
    ),
    characterByApiId: characterResolverInstance.characterByApiId.bind(
      characterResolverInstance
    ),
  },
};
