import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "@/lib/env";
import * as schema from "./schema";

// Singleton postgres connection for server-side Drizzle queries.
// For RLS-aware queries prefer @supabase/ssr client (it carries the user jwt).
// Use this db client for service-level operations (server actions with auth
// already enforced, migrations, cron jobs).

const globalForDb = globalThis as unknown as {
  _pg?: ReturnType<typeof postgres>;
};

function getClient() {
  if (!globalForDb._pg) {
    globalForDb._pg = postgres(env.DATABASE_URL, {
      max: 5,
      prepare: false // needed for Supabase pooler (transaction / session mode)
    });
  }
  return globalForDb._pg;
}

export const db = drizzle(getClient(), { schema });
export { schema };
