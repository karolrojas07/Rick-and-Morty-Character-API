import { getRedisClient, getCacheTTL } from "../config/redis";

export interface CacheParams {
  [key: string]: string | number | undefined | null;
}

export class CacheService {
  private static instance: CacheService;
  private defaultTTL: number;

  private constructor() {
    this.defaultTTL = getCacheTTL();
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * Generate a consistent cache key from parameters
   */
  public generateCacheKey(prefix: string, params: CacheParams): string {
    const filteredParams = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${key}:${value}`)
      .join(":");

    return filteredParams ? `${prefix}:${filteredParams}` : prefix;
  }

  /**
   * Get cached data by key
   */
  public async getCachedData<T>(key: string): Promise<T | null> {
    try {
      const redisClient = getRedisClient();
      if (!redisClient) {
        console.warn("Redis client not available, skipping cache");
        return null;
      }

      const cachedData = await redisClient.get(key);
      if (cachedData) {
        return JSON.parse(cachedData) as T;
      }
      return null;
    } catch (error) {
      console.error("Error getting cached data:", error);
      return null;
    }
  }

  /**
   * Set cached data with TTL
   */
  public async setCachedData<T>(
    key: string,
    data: T,
    ttl?: number
  ): Promise<boolean> {
    try {
      const redisClient = getRedisClient();
      if (!redisClient) {
        console.warn("Redis client not available, skipping cache");
        return false;
      }

      const ttlToUse = ttl || this.defaultTTL;
      const serializedData = JSON.stringify(data);

      await redisClient.setEx(key, ttlToUse, serializedData);
      return true;
    } catch (error) {
      console.error("Error setting cached data:", error);
      return false;
    }
  }

  /**
   * Delete cached data by key
   */
  public async deleteCachedData(key: string): Promise<boolean> {
    try {
      const redisClient = getRedisClient();
      if (!redisClient) {
        console.warn("Redis client not available, skipping cache delete");
        return false;
      }

      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error("Error deleting cached data:", error);
      return false;
    }
  }

  /**
   * Clear cache by pattern
   */
  public async clearCacheByPattern(pattern: string): Promise<boolean> {
    try {
      const redisClient = getRedisClient();
      if (!redisClient) {
        console.warn("Redis client not available, skipping cache clear");
        return false;
      }

      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
      return true;
    } catch (error) {
      console.error("Error clearing cache by pattern:", error);
      return false;
    }
  }

  /**
   * Check if cache is available
   */
  public isCacheAvailable(): boolean {
    return getRedisClient() !== null;
  }
}

export const cacheService = CacheService.getInstance();
