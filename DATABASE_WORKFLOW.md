# Rafiki WasteOS — Dual-Database Architecture & Migration Workflow

Rafiki WasteOS uses **two completely separate Neon PostgreSQL projects/databases** (instead of Neon database branching) to guarantee strict isolation between **Development** and **Production**.

---

## 1. Database Topology Overview

| Environment | Git Branch | Vercel Environment | Neon Project Name | Neon Project ID | Compute Endpoint |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Production** | `main` | **Production** | `rafikiWasteOS` | `restless-flower-97330650` | `ep-frosty-recipe-b40waqwx.c-6.us-east-2.aws.neon.tech` |
| **Development** | `development` | **Preview (`development`)** & Local | `rafikiWasteOS_dev` | `weathered-glade-32717093` | `ep-bold-boat-bd33oipw.c-8.us-east-2.aws.neon.tech` |

* **Zero Shared State:** Each environment is an independent Neon project with its own compute endpoint, connection pooler, credentials, and Neon Auth (`better_auth`) instance.
* **Identical Schema Structure:** Both databases share the exact same 16 `public` tables, 16 PostgreSQL enums, 41 primary/foreign/unique constraints, 31 indexes, and 9 `neon_auth` tables, governed by Drizzle ORM (`server/db/schema/index.ts`).

---

## 2. Environment Variables Configuration

### 2.1 Development Environment (`.env.local` & Vercel `development` Branch / Preview)
Used locally on the `development` Git branch and in Vercel for the `development` branch / Preview deployments:

```dotenv
DATABASE_URL="postgresql://neondb_owner:npg_CUjM1aPEWr4u@ep-bold-boat-bd33oipw-pooler.c-8.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require"
DATABASE_URL_UNPOOLED="postgresql://neondb_owner:npg_CUjM1aPEWr4u@ep-bold-boat-bd33oipw.c-8.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require"
NEON_AUTH_BASE_URL="https://ep-bold-boat-bd33oipw.neonauth.c-8.us-east-2.aws.neon.tech/neondb/auth"
NEON_AUTH_JWKS_URL="https://ep-bold-boat-bd33oipw.neonauth.c-8.us-east-2.aws.neon.tech/neondb/auth/.well-known/jwks.json"
NEON_AUTH_COOKIE_SECRET="rafiki_wasteos_auth_cookie_secret_key_938472910482_emerging_market"
ADMIN_INVITE_KEY="RAFIKI-ADMIN-2026"
```

### 2.2 Production Environment (Vercel **Production** — `main` Git Branch)
Configured in **Vercel → Project Settings → Environment Variables** scoped exclusively to **Production** (`main` branch):

```dotenv
DATABASE_URL="postgresql://neondb_owner:npg_pw49JmHWbgIS@ep-frosty-recipe-b40waqwx-pooler.c-6.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require"
DATABASE_URL_UNPOOLED="postgresql://neondb_owner:npg_pw49JmHWbgIS@ep-frosty-recipe-b40waqwx.c-6.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require"
NEON_AUTH_BASE_URL="https://ep-frosty-recipe-b40waqwx.neonauth.c-6.us-east-2.aws.neon.tech/neondb/auth"
NEON_AUTH_JWKS_URL="https://ep-frosty-recipe-b40waqwx.neonauth.c-6.us-east-2.aws.neon.tech/neondb/auth/.well-known/jwks.json"
NEON_AUTH_COOKIE_SECRET="rafiki_wasteos_auth_cookie_secret_key_938472910482_emerging_market"
ADMIN_INVITE_KEY="RAFIKI-ADMIN-2026"
```

### 2.3 How to Configure in Vercel Dashboard
1. Open your project in the **Vercel Dashboard → Settings → Environment Variables**.
2. For **`DATABASE_URL`**, **`DATABASE_URL_UNPOOLED`**, **`NEON_AUTH_BASE_URL`**, and **`NEON_AUTH_JWKS_URL`**:
   * Create one set checked **only for `Production`** using the **Production (`rafikiWasteOS` / `ep-frosty-recipe-b40waqwx`)** values above.
   * Create a second set checked **for `Preview` and `Development`** (or scoped to the `development` Git branch) using the **Development (`rafikiWasteOS_dev` / `ep-bold-boat-bd33oipw`)** values above.
3. Remove any legacy `NEON_BRANCH` environment variable from Vercel if present.

---

## 3. Daily Development & Schema Migration Workflow

All schema definitions live in [`server/db/schema/`](./server/db/schema/index.ts) and are configured via [`drizzle.config.ts`](./drizzle.config.ts).

### Step 1: Work on the `development` Git Branch
```bash
git checkout development
```
Your local `.env.local` points to `rafikiWasteOS_dev` (`weathered-glade-32717093`). All local testing, seeding, and schema experimentation happen against the Development database without touching Production.

### Step 2: Modify Drizzle Schema & Apply to Development Database
1. Edit the schema files in `server/db/schema/*.ts`.
2. Generate a tracked SQL migration file in `server/db/migrations/`:
   ```bash
   npm run db:generate
   ```
3. Apply the schema changes to the **Development Database**:
   ```bash
   npm run db:push
   ```
4. (Optional) Re-seed dummy/demo data in the Development Database at any time:
   ```bash
   npm run db:seed
   ```

### Step 3: Commit & Push to `development`
```bash
git add .
git commit -m "feat: description of change and migration"
git push origin development
```
Vercel automatically builds the preview deployment for `development` connected to `rafikiWasteOS_dev`.

### Step 4: Promote Schema & Code to Production (`main`)
Once tested and verified on `development`:
1. Apply the tested schema migration to the **Production Database** before or during release:
   ```bash
   # Using a temporary git-ignored .env.production.local containing the Production DATABASE_URL_UNPOOLED:
   DOTENV_CONFIG_PATH=.env.production.local npm run db:push
   ```
2. Merge `development` into `main` and push to trigger the Production Vercel deployment:
   ```bash
   git checkout main
   git merge development
   git push origin main
   ```
