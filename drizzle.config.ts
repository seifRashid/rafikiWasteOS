import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// Load environment variables from DOTENV_CONFIG_PATH if provided, otherwise default to .env.local (Development DB)
const envPath = process.env.DOTENV_CONFIG_PATH || ".env.local";
dotenv.config({ path: envPath });

const databaseUrl =
  process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL || "";

export default defineConfig({
  schema: "./server/db/schema/index.ts",
  out: "./server/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
