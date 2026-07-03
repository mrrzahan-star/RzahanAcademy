import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// For Netlify Functions (serverless), keep the pool small so we don't exhaust
// Supabase connection limits. Use the Supabase Transaction Pooler URL (port 6543)
// in production for best results.
const isServerless = process.env.NETLIFY === "true";
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: isServerless ? 1 : 10,
  idleTimeoutMillis: isServerless ? 1000 : 10000,
  connectionTimeoutMillis: 5000,
});
export const db = drizzle(pool, { schema });

export * from "./schema";
