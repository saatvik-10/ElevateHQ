import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { Pool } from "pg";

import { env } from "@/env";

declare global {
  var __elevatePrisma: PrismaClient | undefined;
  var __elevatePool: Pool | undefined;
}

const pool =
  globalThis.__elevatePool ??
  new Pool({
    connectionString: env.DATABASE_URL,
    max: 10,
  });
const adapter = new PrismaPg(pool);

export const db =
  globalThis.__elevatePrisma ??
  new PrismaClient({
    adapter,
    log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (env.NODE_ENV !== "production") {
  globalThis.__elevatePool = pool;
  globalThis.__elevatePrisma = db;
}
