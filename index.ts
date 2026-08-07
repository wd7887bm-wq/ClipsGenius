import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
  __arenaNextJsDrizzleDb?: NodePgDatabase;
};

export function getDb(): NodePgDatabase {
  if (globalForDb.__arenaNextJsDrizzleDb) {
    return globalForDb.__arenaNextJsDrizzleDb;
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  if (!globalForDb.__arenaNextJsPostgresqlPool) {
    globalForDb.__arenaNextJsPostgresqlPool = new Pool({
      connectionString: databaseUrl,
    });
  }

  globalForDb.__arenaNextJsDrizzleDb = drizzle(globalForDb.__arenaNextJsPostgresqlPool);
  return globalForDb.__arenaNextJsDrizzleDb;
}

// Lazy proxy that only initializes at runtime when actually used
export const db = new Proxy({} as NodePgDatabase, {
  get(_target, prop: string | symbol) {
    const instance = getDb();
    const value = instance[prop as keyof NodePgDatabase];
    if (typeof value === "function") {
      return value.bind(instance);
    }
    return value;
  },
});
