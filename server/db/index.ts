import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const fallbackDummyUrl =
  "postgresql://placeholder:placeholder@ep-placeholder.us-east-2.aws.neon.tech/neondb";

const connectionString = process.env.DATABASE_URL || fallbackDummyUrl;

export const isDatabaseConfigured = Boolean(
  process.env.DATABASE_URL &&
    process.env.DATABASE_URL.startsWith("postgres") &&
    !process.env.DATABASE_URL.includes("placeholder")
);

// Neon HTTP serverless client for ultra-fast App Router edge & serverless compatibility
const sql = neon(connectionString);

export const db = drizzle(sql, { schema });
export * from "./schema";
