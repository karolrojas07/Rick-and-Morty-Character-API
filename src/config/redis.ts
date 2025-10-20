import { createClient, RedisClientType } from "redis";
import dotenv from "dotenv";

dotenv.config();

const redisConfig = {
  host: process.env["REDIS_HOST"] || "localhost",
  port: parseInt(process.env["REDIS_PORT"] || "6379"),
  password: process.env["REDIS_PASSWORD"] || undefined,
};

let redisClient: RedisClientType | null = null;

export const initializeRedis = async (): Promise<RedisClientType> => {
  if (redisClient) {
    return redisClient;
  }

  try {
    redisClient = createClient({
      socket: {
        host: redisConfig.host,
        port: redisConfig.port,
      },
      password: redisConfig.password,
    });

    redisClient.on("error", (err) => {
      console.error("Redis Client Error:", err);
    });

    redisClient.on("connect", () => {
      console.log("Connected to Redis");
    });

    redisClient.on("ready", () => {
      console.log("Redis client ready");
    });

    redisClient.on("end", () => {
      console.log("Redis connection ended");
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
    throw error;
  }
};

export const getRedisClient = (): RedisClientType | null => {
  return redisClient;
};

export const closeRedisConnection = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.log("Redis connection closed");
  }
};

export const getCacheTTL = (): number => {
  return parseInt(process.env["CACHE_TTL"] || "3600");
};
