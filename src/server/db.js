import "server-only";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

const globalDb = globalThis;

export function getDb() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
  if (!globalDb.aethraPool) {
    globalDb.aethraPool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
    });
    globalDb.aethraPool.on("error", () => console.error("Database connection interrupted"));
  }
  return drizzle(globalDb.aethraPool);
}
