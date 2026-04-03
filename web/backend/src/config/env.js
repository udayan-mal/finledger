import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 4000),
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL,
  accessSecret: process.env.JWT_ACCESS_SECRET || "access-secret",
  refreshSecret: process.env.JWT_REFRESH_SECRET || "refresh-secret",
  accessTtl: process.env.ACCESS_TOKEN_TTL || "15m",
  refreshTtl: process.env.REFRESH_TOKEN_TTL || "30d",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  claudeApiKey: process.env.CLAUDE_API_KEY || ""
};
