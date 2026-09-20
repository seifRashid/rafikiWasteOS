import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const fallbackDummyUrl =
  "postgresql://placeholder:placeholder@ep-placeholder.us-east-2.aws.neon.tech/neondb";

function sanitizeConnectionString(rawUrl?: string): string | null {
  if (!rawUrl || typeof rawUrl !== "string") return null;
  let clean = rawUrl.trim();

  // Strip wrapping double or single quotes (often accidentally pasted from .env files into Vercel)
  if (
    (clean.startsWith('"') && clean.endsWith('"')) ||
    (clean.startsWith("'") && clean.endsWith("'"))
  ) {
    clean = clean.slice(1, -1).trim();
  }

  try {
    const parsed = new URL(clean);
    if (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:") {
      return null;
    }
    return clean;
  } catch {
    return null;
  }
}

const sanitizedUrl = sanitizeConnectionString(process.env.DATABASE_URL);
const connectionString = sanitizedUrl || fallbackDummyUrl;

export const isDatabaseConfigured = Boolean(
  sanitizedUrl && !sanitizedUrl.includes("placeholder")
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
