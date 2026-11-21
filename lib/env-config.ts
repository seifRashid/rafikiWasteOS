/**
 * Centralized, quote-safe environment configuration for Rafiki WasteOS.
 * Guarantees strict separation between the standalone Development and Production
 * Neon PostgreSQL databases across local dev, Vercel Preview (`development`),
 * and Vercel Production (`main`), even if Vercel dashboard variables contain
 * wrapping quotes, trailing slashes, or legacy branch endpoints.
 */

export interface RuntimeEnvConfig {
  environment: "production" | "development";
  databaseUrl: string;
  databaseUrlUnpooled: string;
  neonAuthBaseUrl: string;
  neonAuthJwksUrl: string;
  neonAuthCookieSecret: string;
}

// 1. Standalone Development Neon Project: rafikiWasteOS_dev (weathered-glade-32717093)
const DEV_CONFIG = {
  endpointId: "ep-bold-boat-bd33oipw",
  databaseUrl:
    "postgresql://neondb_owner:npg_CUjM1aPEWr4u@ep-bold-boat-bd33oipw-pooler.c-8.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require",
  databaseUrlUnpooled:
    "postgresql://neondb_owner:npg_CUjM1aPEWr4u@ep-bold-boat-bd33oipw.c-8.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require",
  neonAuthBaseUrl:
    "https://ep-bold-boat-bd33oipw.neonauth.c-8.us-east-2.aws.neon.tech/neondb/auth",
  neonAuthJwksUrl:
    "https://ep-bold-boat-bd33oipw.neonauth.c-8.us-east-2.aws.neon.tech/neondb/auth/.well-known/jwks.json",
} as const;

// 2. Standalone Production Neon Project: rafikiWasteOS (restless-flower-97330650)
const PROD_CONFIG = {
  endpointId: "ep-frosty-recipe-b40waqwx",
  databaseUrl:
    "postgresql://neondb_owner:npg_pw49JmHWbgIS@ep-frosty-recipe-b40waqwx-pooler.c-6.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require",
  databaseUrlUnpooled:
    "postgresql://neondb_owner:npg_pw49JmHWbgIS@ep-frosty-recipe-b40waqwx.c-6.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require",
  neonAuthBaseUrl:
    "https://ep-frosty-recipe-b40waqwx.neonauth.c-6.us-east-2.aws.neon.tech/neondb/auth",
  neonAuthJwksUrl:
    "https://ep-frosty-recipe-b40waqwx.neonauth.c-6.us-east-2.aws.neon.tech/neondb/auth/.well-known/jwks.json",
} as const;

// Legacy child-branch endpoint (deprecated after moving away from Neon branching)
const LEGACY_BRANCH_ENDPOINT = "ep-odd-firefly-b49w57ai";

const DEFAULT_COOKIE_SECRET =
  "rafiki_wasteos_auth_cookie_secret_key_938472910482_emerging_market";

/**
 * Strips whitespace, wrapping single/double quotes (even nested), and optional trailing slashes.
 */
export function sanitizeEnvString(raw?: string | null, stripTrailingSlash = false): string | null {
  if (!raw || typeof raw !== "string") return null;
  let clean = raw.trim();

  while (
    (clean.startsWith('"') && clean.endsWith('"')) ||
    (clean.startsWith("'") && clean.endsWith("'"))
  ) {
    clean = clean.slice(1, -1).trim();
  }

  if (stripTrailingSlash) {
    clean = clean.replace(/\/+$/, "");
  }

  return clean || null;
}

export function sanitizePostgresUrl(raw?: string | null): string | null {
  const clean = sanitizeEnvString(raw, false);
  if (!clean) return null;
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

export function sanitizeHttpsUrl(raw?: string | null): string | null {
  const clean = sanitizeEnvString(raw, true);
  if (!clean) return null;
  try {
    const parsed = new URL(clean);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return null;
    }
    return clean;
  } catch {
    return null;
  }
}

/**
 * Determines whether the current execution context is Production (`main`) or Development (`development` / Preview / Local).
 */
export function isProductionEnvironment(): boolean {
  const gitBranch = sanitizeEnvString(process.env.VERCEL_GIT_COMMIT_REF);
  const vercelEnv = sanitizeEnvString(process.env.VERCEL_ENV);

  if (gitBranch === "development") return false;
  if (gitBranch === "main") return true;
  if (vercelEnv === "preview" || vercelEnv === "development") return false;
  if (vercelEnv === "production") return true;

  return false;
}

/**
 * Resolves the active database and Neon Auth configuration with guaranteed validity and parity.
 */
export function getRuntimeEnvConfig(): RuntimeEnvConfig {
  const isProd = isProductionEnvironment();
  const targetDefaults = isProd ? PROD_CONFIG : DEV_CONFIG;

  const rawDbUrl = sanitizePostgresUrl(process.env.DATABASE_URL);
  const rawDbUnpooled = sanitizePostgresUrl(process.env.DATABASE_URL_UNPOOLED);
  const rawAuthBaseUrl = sanitizeHttpsUrl(process.env.NEON_AUTH_BASE_URL);
  const rawAuthJwksUrl = sanitizeHttpsUrl(process.env.NEON_AUTH_JWKS_URL);

  // Check if the supplied env var is valid for the current environment
  // (Rejects legacy branch endpoint ep-odd-firefly-b49w57ai or cross-environment leakage on Vercel Preview/Prod)
  const isValidForTarget = (url: string | null): boolean => {
    if (!url) return false;
    if (url.includes("placeholder")) return false;
    if (url.includes(LEGACY_BRANCH_ENDPOINT)) return false;
    if (!isProd && url.includes(PROD_CONFIG.endpointId)) return false;
    if (isProd && url.includes(DEV_CONFIG.endpointId)) return false;
    return true;
  };

  const databaseUrl = isValidForTarget(rawDbUrl) && rawDbUrl ? rawDbUrl : targetDefaults.databaseUrl;
  const databaseUrlUnpooled =
    isValidForTarget(rawDbUnpooled) && rawDbUnpooled
      ? rawDbUnpooled
      : targetDefaults.databaseUrlUnpooled;

  // Ensure Neon Auth Base URL always matches the active database project
  let neonAuthBaseUrl =
    isValidForTarget(rawAuthBaseUrl) && rawAuthBaseUrl
      ? rawAuthBaseUrl
      : targetDefaults.neonAuthBaseUrl;

  if (databaseUrl.includes(DEV_CONFIG.endpointId)) {
    neonAuthBaseUrl = DEV_CONFIG.neonAuthBaseUrl;
  } else if (databaseUrl.includes(PROD_CONFIG.endpointId)) {
    neonAuthBaseUrl = PROD_CONFIG.neonAuthBaseUrl;
  }

  let neonAuthJwksUrl =
    isValidForTarget(rawAuthJwksUrl) && rawAuthJwksUrl
      ? rawAuthJwksUrl
      : `${neonAuthBaseUrl}/.well-known/jwks.json`;

  if (databaseUrl.includes(DEV_CONFIG.endpointId)) {
    neonAuthJwksUrl = DEV_CONFIG.neonAuthJwksUrl;
  } else if (databaseUrl.includes(PROD_CONFIG.endpointId)) {
    neonAuthJwksUrl = PROD_CONFIG.neonAuthJwksUrl;
  }

  const rawSecret = sanitizeEnvString(process.env.NEON_AUTH_COOKIE_SECRET);
  const neonAuthCookieSecret =
    rawSecret && rawSecret.length >= 32 ? rawSecret : DEFAULT_COOKIE_SECRET;

  return {
    environment: isProd ? "production" : "development",
    databaseUrl,
    databaseUrlUnpooled,
    neonAuthBaseUrl,
    neonAuthJwksUrl,
    neonAuthCookieSecret,
  };
}
