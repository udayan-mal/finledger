import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";
import { redis } from "./config/redis.js";

let server;

const start = async () => {
  try {
    await prisma.$connect();
    await redis.connect().catch(() => {});

    server = app.listen(env.port, () => {
      console.log(`FinLedger backend running on port ${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

// Graceful shutdown for nodemon restarts (prevents EADDRINUSE on Windows)
const shutdown = () => {
  if (server) {
    server.close(() => process.exit(0));
  } else {
    process.exit(0);
  }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
process.once("SIGUSR2", () => {
  if (server) server.close(() => process.kill(process.pid, "SIGUSR2"));
});

start();
