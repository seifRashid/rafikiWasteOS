import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { getRuntimeEnvConfig } from "@/lib/env-config";

if (!process.env.DATABASE_URL) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const dotenv = require("dotenv");
    dotenv.config({ path: ".env.local" });
  } catch {
    // Ignore in production
  }
}

const fallbackDummyUrl =
  "postgresql://placeholder:placeholder@ep-placeholder.us-east-2.aws.neon.tech/neondb";

const runtimeEnv = getRuntimeEnvConfig();
const connectionString = runtimeEnv.databaseUrl || fallbackDummyUrl;

export const isDatabaseConfigured = Boolean(
  connectionString && !connectionString.includes("placeholder")
);

// Neon HTTP serverless client for ultra-fast App Router edge & serverless compatibility
let sqlClient: ReturnType<typeof neon>;
try {
  sqlClient = neon(connectionString);
} catch (err) {
  console.warn("[Rafiki WasteOS] Falling back to safe dummy SQL client:", err);
  sqlClient = neon(fallbackDummyUrl);
}

export const sql = sqlClient;
export const db = drizzle(sql, { schema });
export * from "./schema";
