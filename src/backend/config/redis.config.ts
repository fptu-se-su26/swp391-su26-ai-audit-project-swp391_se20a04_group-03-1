import 'dotenv/config';
import { createClient } from "redis";

export const redisClient = createClient({
  url: `redis://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 2) {
        return false;
      }
      return 1000;
    }
  }
});

redisClient.on("error", (err) => console.error("Redis Client Error", err.message || err));

export const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log("Redis connected successfully");
  } catch (error) {
    console.warn("Could not connect to Redis. Switching to in-memory fallback store.");
    
    const memoryStore = new Map<string, string>();
    
    Object.defineProperty(redisClient, 'get', {
      value: async (key: string) => {
        return memoryStore.has(key) ? memoryStore.get(key) : null;
      },
      writable: true,
      configurable: true
    });
    
    Object.defineProperty(redisClient, 'setEx', {
      value: async (key: string, seconds: number, value: string) => {
        memoryStore.set(key, value);
        return 'OK';
      },
      writable: true,
      configurable: true
    });
    
    Object.defineProperty(redisClient, 'del', {
      value: async (key: string) => {
        return memoryStore.delete(key) ? 1 : 0;
      },
      writable: true,
      configurable: true
    });
  }
};

