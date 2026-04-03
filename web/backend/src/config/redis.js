import Redis from "ioredis";
import { env } from "./env.js";

export const redis = new Redis(env.redisUrl, { maxRetriesPerRequest: 3, lazyConnect: true });

redis.on("error", () => {
  // Redis is optional for local bootstrap; API still works without cache.
});
