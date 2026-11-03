import { app } from "./app";
import { env } from "./config/env";
import { prisma } from "./lib/prisma";

async function start() {
  await prisma.$connect();
  app.listen(env.port, () => {
    console.log(`Divine Drops API running on http://localhost:${env.port}`);
  });
}

start().catch((err) => {
  console.error("Failed to start API", err);
  process.exit(1);
});
