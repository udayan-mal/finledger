import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";
import { redis } from "./config/redis.js";

const start = async () => {
  try {
    await prisma.$connect();
    await redis.connect().catch(() => {});

    app.listen(env.port, () => {
      console.log(`FinLedger backend running on port ${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

start();
