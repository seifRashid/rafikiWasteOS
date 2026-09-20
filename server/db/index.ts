import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || "";

// Neon HTTP serverless client for ultra-fast App Router edge & serverless compatibility
const sql = neon(connectionString);

export const db = drizzle(sql, { schema });
export * from "./schema";
