// Jest globals are available in test environment
import { CharacterResolver } from "../../../graphql/resolvers/character.resolver";
import { cacheService } from "../../../services/cache.service";
import { Character, Origin } from "../../../models";
import {
  initializeTestDb,
  seedTestData,
  clearTestData,
  closeTestDb,
} from "../../utils/testDb";

// Mock the cache service
jest.mock("../../../services/cache.service", () => ({
  cacheService: {
    generateCacheKey: jest.fn(),
    getCachedData: jest.fn(),
    setCachedData: jest.fn(),
  },
}));

const mockedCacheService = cacheService as jest.Mocked<typeof cacheService>;

describe("CharacterResolver", () => {
  let characterResolver: CharacterResolver;

  beforeAll(async () => {
    process.env["NODE_ENV"] = "test";
    await initializeTestDb();
  });

  beforeEach(async () => {
    characterResolver = new CharacterResolver();
    await seedTestData();

    // Reset all mocks
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await clearTestData();
  });

  afterAll(async () => {
    await closeTestDb();
    process.env["NODE_ENV"] = "development";
  });

  describe("characters()", () => {
    it("should return all characters with default pagination when no filters provided", async () => {
      // Mock cache miss
      mockedCacheService.getCachedData.mockResolvedValue(null);
      mockedCacheService.generateCacheKey.mockReturnValue(
        "characters:limit:20:offset:0"
      );

      const result = await characterResolver.characters({}, {});

      expect(result).toHaveLength(8); // All test characters
      expect((result as any)[0]).toHaveProperty("name");
      expect((result as any)[0]).toHaveProperty("status");
      expect((result as any)[0]).toHaveProperty("species");
      expect((result as any)[0]).toHaveProperty("gender");
      expect((result as any)[0]).toHaveProperty("origin");
      expect((result as any)[0].origin).toBeDefined();

      // Verify cache was called
      expect(mockedCacheService.generateCacheKey).toHaveBeenCalledWith(
        "characters",
        {
          name: "",
          status: "",
          species: "",
          gender: "",
          origin_id: "",
          limit: 20,
          offset: 0,
        }
      );
      expect(mockedCacheService.getCachedData).toHaveBeenCalledWith(
        "characters:limit:20:offset:0"
      );
      expect(mockedCacheService.setCachedData).toHaveBeenCalledWith(
        "characters:limit:20:offset:0",
        result
      );
    });

    it("should return cached data when available", async () => {
      const cachedCharacters = [
        {
          id: 1,
          api_id: 1,
          name: "Rick Sanchez",
          status: "Alive",
          species: "Human",
          gender: "Male",
          origin_id: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          origin: {
            id: 1,
            api_id: 1,
            name: "Earth C-137",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      ];

      mockedCacheService.getCachedData.mockResolvedValue(cachedCharacters);
      mockedCacheService.generateCacheKey.mockReturnValue(
        "characters:limit:20:offset:0"
      );

      const result = await characterResolver.characters({}, {});

      expect(result).toEqual(cachedCharacters);
      expect(mockedCacheService.getCachedData).toHaveBeenCalledWith(
        "characters:limit:20:offset:0"
      );
      expect(mockedCacheService.setCachedData).not.toHaveBeenCalled();
    });

    it("should filter characters by name (case-insensitive partial match)", async () => {
      mockedCacheService.getCachedData.mockResolvedValue(null);
      mockedCacheService.generateCacheKey.mockReturnValue(
        "characters:name:Rick:limit:20:offset:0"
      );

      const result = await characterResolver.characters({}, { name: "Rick" });

      expect(result).toHaveLength(1);
      expect((result as any)[0].name).toBe("Rick Sanchez");
      expect(mockedCacheService.generateCacheKey).toHaveBeenCalledWith(
        "characters",
        {
          name: "Rick",
          status: "",
          species: "",
          gender: "",
          origin_id: "",
          limit: 20,
          offset: 0,
        }
      );
    });

    it("should filter characters by status", async () => {
      mockedCacheService.getCachedData.mockResolvedValue(null);
      mockedCacheService.generateCacheKey.mockReturnValue(
        "characters:status:Alive:limit:20:offset:0"
      );

      const result = await characterResolver.characters(
        {},
        { status: "Alive" }
      );

      expect(result).toHaveLength(5); // Rick, Morty, Summer, Jerry, Beth
      expect(
        (result as any).every((char: any) => char.status === "Alive")
      ).toBe(true);
    });

    it("should filter characters by species", async () => {
      mockedCacheService.getCachedData.mockResolvedValue(null);
      mockedCacheService.generateCacheKey.mockReturnValue(
        "characters:species:Human:limit:20:offset:0"
      );

      const result = await characterResolver.characters(
        {},
        { species: "Human" }
      );

      expect(result).toHaveLength(5); // All Smith family members
      expect(
        (result as any).every((char: any) => char.species === "Human")
      ).toBe(true);
    });

    it("should filter characters by gender", async () => {
      mockedCacheService.getCachedData.mockResolvedValue(null);
      mockedCacheService.generateCacheKey.mockReturnValue(
        "characters:gender:Male:limit:20:offset:0"
      );

      const result = await characterResolver.characters({}, { gender: "Male" });

      expect(result).toHaveLength(6); // Rick, Morty, Jerry, Birdperson, Squanchy, Mr. Meeseeks
      expect((result as any).every((char: any) => char.gender === "Male")).toBe(
        true
      );
    });

    it("should filter characters by origin_id", async () => {
      mockedCacheService.getCachedData.mockResolvedValue(null);
      mockedCacheService.generateCacheKey.mockReturnValue(
        "characters:origin_id:1:limit:20:offset:0"
      );

      const result = await characterResolver.characters({}, { origin_id: 1 });

      expect(result).toHaveLength(5); // All characters from Earth C-137
      expect((result as any).every((char: any) => char.origin_id === 1)).toBe(
        true
      );
    });

    it("should combine multiple filters", async () => {
      mockedCacheService.getCachedData.mockResolvedValue(null);
      mockedCacheService.generateCacheKey.mockReturnValue(
        "characters:name:Smith:status:Alive:limit:20:offset:0"
      );

      const result = await characterResolver.characters(
        {},
        {
          name: "Smith",
          status: "Alive",
        }
      );

      expect(result).toHaveLength(4); // Morty, Summer, Jerry, Beth Smith
      expect(
        (result as any).every(
          (char: any) => char.name.includes("Smith") && char.status === "Alive"
        )
      ).toBe(true);
    });

    it("should respect pagination with limit and offset", async () => {
      mockedCacheService.getCachedData.mockResolvedValue(null);
      mockedCacheService.generateCacheKey.mockReturnValue(
        "characters:limit:3:offset:2"
      );

      const result = await characterResolver.characters(
        {},
        {
          limit: 3,
          offset: 2,
        }
      );

      expect(result).toHaveLength(3);
      expect(mockedCacheService.generateCacheKey).toHaveBeenCalledWith(
        "characters",
        {
          name: "",
          status: "",
          species: "",
          gender: "",
          origin_id: "",
          limit: 3,
          offset: 2,
        }
      );
    });

    it("should order characters alphabetically by name", async () => {
      mockedCacheService.getCachedData.mockResolvedValue(null);
      mockedCacheService.generateCacheKey.mockReturnValue(
        "characters:limit:20:offset:0"
      );

      const result = await characterResolver.characters({}, {});

      // Check that results are ordered alphabetically by name
      for (let i = 1; i < (result as any).length; i++) {
        expect(
          (result as any)[i - 1].name.localeCompare((result as any)[i].name)
        ).toBeLessThanOrEqual(0);
      }
    });

    it("should include origin data in results", async () => {
      mockedCacheService.getCachedData.mockResolvedValue(null);
      mockedCacheService.generateCacheKey.mockReturnValue(
        "characters:limit:20:offset:0"
      );

      const result = await characterResolver.characters({}, {});

      expect((result as any)[0].origin).toBeDefined();
      expect((result as any)[0].origin).toHaveProperty("id");
      expect((result as any)[0].origin).toHaveProperty("name");
    });
  });

  describe("character()", () => {
    it("should return character by ID with origin included", async () => {
      const testCharacter = await Character.findOne({
        where: { name: "Rick Sanchez" },
        include: [{ model: Origin, as: "origin" }],
      });

      mockedCacheService.getCachedData.mockResolvedValue(null);
      mockedCacheService.generateCacheKey.mockReturnValue("character:id:1");

      const result = await characterResolver.character(
        {},
        { id: testCharacter!.id }
      );

      expect(result).toBeDefined();
      expect((result as any)!.name).toBe("Rick Sanchez");
      expect((result as any)!.origin).toBeDefined();
      expect(mockedCacheService.generateCacheKey).toHaveBeenCalledWith(
        "character",
        { id: testCharacter!.id }
      );
      expect(mockedCacheService.setCachedData).toHaveBeenCalledWith(
        "character:id:1",
        result
      );
    });

    it("should return null when character not found", async () => {
      mockedCacheService.getCachedData.mockResolvedValue(null);
      mockedCacheService.generateCacheKey.mockReturnValue("character:id:999");
      let result: any;
      try {
        result = await characterResolver.character({}, { id: 999 });
      } catch (error) {
        console.error(error);
      }

      expect(result).toBeNull();
      expect(mockedCacheService.setCachedData).not.toHaveBeenCalled();
    });

    it("should return cached data when available", async () => {
      const cachedCharacter = {
        id: 1,
        api_id: 1,
        name: "Rick Sanchez",
        status: "Alive",
        species: "Human",
        gender: "Male",
        origin_id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        origin: {
          id: 1,
          api_id: 1,
          name: "Earth C-137",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      mockedCacheService.getCachedData.mockResolvedValue(cachedCharacter);
      mockedCacheService.generateCacheKey.mockReturnValue("character:id:1");

      const result = await characterResolver.character({}, { id: 1 });

      expect(result).toEqual(cachedCharacter);
      expect(mockedCacheService.setCachedData).not.toHaveBeenCalled();
    });
  });

  describe("characterByApiId()", () => {
    it("should return character by api_id with origin included", async () => {
      mockedCacheService.getCachedData.mockResolvedValue(null);
      mockedCacheService.generateCacheKey.mockReturnValue(
        "character:api:api_id:1"
      );

      const result = await characterResolver.characterByApiId(
        {},
        { api_id: 1 }
      );

      expect(result).toBeDefined();
      expect((result as any)!.name).toBe("Rick Sanchez");
      expect((result as any)!.origin).toBeDefined();
      expect(mockedCacheService.generateCacheKey).toHaveBeenCalledWith(
        "character:api",
        { api_id: 1 }
      );
      expect(mockedCacheService.setCachedData).toHaveBeenCalledWith(
        "character:api:api_id:1",
        result
      );
    });

    it("should return null when character not found", async () => {
      mockedCacheService.getCachedData.mockResolvedValue(null);
      mockedCacheService.generateCacheKey.mockReturnValue(
        "character:api:api_id:999"
      );

      const result = await characterResolver.characterByApiId(
        {},
        { api_id: 999 }
      );

      expect(result).toBeNull();
      expect(mockedCacheService.setCachedData).not.toHaveBeenCalled();
    });

    it("should return cached data when available", async () => {
      const cachedCharacter = {
        id: 1,
        api_id: 1,
        name: "Rick Sanchez",
        status: "Alive",
        species: "Human",
        gender: "Male",
        origin_id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        origin: {
          id: 1,
          api_id: 1,
          name: "Earth C-137",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      mockedCacheService.getCachedData.mockResolvedValue(cachedCharacter);
      mockedCacheService.generateCacheKey.mockReturnValue(
        "character:api:api_id:1"
      );

      const result = await characterResolver.characterByApiId(
        {},
        { api_id: 1 }
      );

      expect(result).toEqual(cachedCharacter);
      expect(mockedCacheService.setCachedData).not.toHaveBeenCalled();
    });
  });
});
