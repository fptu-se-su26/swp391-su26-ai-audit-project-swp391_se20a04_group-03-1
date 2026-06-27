import 'dotenv/config';
import { createClient } from "redis";

const redisPassword = process.env.REDIS_PASSWORD ? `:${process.env.REDIS_PASSWORD}@` : "";
const redisHost = process.env.REDIS_HOST || "127.0.0.1";
const redisPort = process.env.REDIS_PORT || "6379";

export const redisClient = createClient({
  url: `redis://${redisPassword}${redisHost}:${redisPort}`,
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));

export const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log("Redis connected successfully");
  } catch (error) {
    console.error("Could not connect to Redis", error);
  }
};
