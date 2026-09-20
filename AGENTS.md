# Rafiki WasteOS — Engineering & AI Agent Architecture Manual

> **Product:** Rafiki WasteOS  
> **Tagline:** One simple system to manage waste, people, money and impact.  
> **Core Operating Principle:** *"If a waste company can run its daily operations from a phone, the software is doing its job."*  
> **Target Audience:** Waste haulers, aggregators, recyclers, material recovery facilities (MRFs), community-based organisations (CBOs), SMEs, municipal contractors, and environmental NGOs across emerging markets (Africa-first: Kenya, Uganda, Tanzania, Rwanda, Ghana, South Africa, and expanding globally).

---

## 1. Product Context & Operational Philosophy

Rafiki WasteOS is an enterprise-grade, mobile-first Waste & Circular Economy Operating System. Unlike generic corporate ERPs, Rafiki WasteOS is built from the ground up to handle the non-linear physical realities of waste logistics: mixed materials, fragmented collection points, weighbridge discrepancies, sorting shrinkage, scrap pricing fluctuations, and offline field operations.

### The Canonical Operational Backbone

Every software feature, database table, and user interface must align with the **single continuous operational pipeline**:

```
[ CLIENT / CONTRACT / SERVICE REQUEST ]
                   │
                   ▼
           [ COLLECTION JOB ]
                   │
                   ▼
         [ ROUTE PLANNING / DISPATCH ]
                   │
                   ▼
      [ FIELD COLLECTION (Mobile/Offline) ]
      (Driver + Vehicle + GPS + Photos)
                   │
                   ▼
      [ WEIGHBRIDGE / DEPOT INTAKE ]
                   │
                   ▼
    [ MATERIAL RECOVERY & SORTING INVENTORY ]
    (Collected → Sorted → Stored → Processed)
                   │
                   ▼
         [ SALE / TRANSFER / DISPOSAL ]
                   │
                   ▼
     [ INVOICING & PAYMENT RECONCILIATION ]
                   │
                   ▼
 ┌─────────────────┴──────────────────┐
 │                                    │
 ▼                                    ▼
[ FINANCIAL REPORTING ]    [ IMPACT & DIVERSION AUDIT ]
(P&L, Cashflow, Projects)  (Recycled, Composted, Diverted)
```

---

## 2. Product Roadmap & Phasing Strategy

AI coding agents must respect these phase boundaries. **Do not prematurely engineer Phase 2 or Phase 3 systems when implementing MVP features.**

### Phase 1: MVP Core (8 Essential Modules)

| Module | Priority | Functional Scope |
| :--- | :--- | :--- |
| **1. Executive Dashboard** | 🔴 Critical | Command center: Active clients, today's collections, collected vs recovered tonnage, revenue/expenses/debt, fleet status, diversion rate, alerts. |
| **2. Client & Contract Management**| 🔴 Critical | CRM, customer tiers (Household, Apartment, Hotel, Business, School, Gov), collection schedules, container info, pricing, payment history. |
| **3. Waste Collection & Job Management** | 🔴 Critical | Digital job lifecycle: `Scheduled` → `Assigned` → `In Progress` → `Collected` → `Delivered` → `Completed`. Photos, weight, GPS capture. |
| **4. Route Management & Planning** | 🔴 Critical | Daily route manifests, driver/truck assignment, map visualization, missed stop rescheduling, km and fuel tracking. *(No complex AI routing in v1; reliable mapping first).* |
| **5. Recyclable Waste Inventory** | 🔴 Critical | Material-flow tracking (PET, HDPE, LDPE, PP, Cardboard, Glass, Metal, Organics) across: `Collected` → `Sorted` → `Stored` → `Processed` → `Sold/Transferred`. |
| **6. Simple Finance & Billing** | 🔴 Critical | Invoices, receipts, collection fees, scrap sales, operational expenses (fuel, maintenance, wages), cashflow, and donor/project cost tracking. |
| **7. Vehicle & Asset Management** | 🟠 High | Fleet telemetry, service due alerts (e.g., "Service due in 350 km"), fuel/mileage logs, inspection records, bin & compactor asset inventory. |
| **8. Reports & Environmental Impact**| 🔴 Critical | Instant PDF/Excel/CSV exports: Daily/monthly operations, financial P&L, and client sustainability certificates showing tonnes diverted, recycled, composted, and disposed. |

### Phase 2: Operational Scale

* HR & Workforce operations (Attendance, shifts, PPE allocation, incident reporting).
* General Inventory (Consumables: bin liners, gloves, safety boots, tools, spare parts).
* Lightweight Procurement (Supplier → Request → Purchase Order → Delivery → Stock).
* Customer Self-Service Portal (Collection requests, invoice downloads, balance payments).
* Multi-Country Compliance Manager (Configurable permit/licence alerts: NEMA, local council permits).
* Project Accounting Module (Deep NGO / donor grant tracking).

### Phase 3: Advanced Intelligence & Automation

* Machine-learning assisted route optimization based on traffic and fill telemetry.
* Smart bin IoT sensor telemetry & fill-level heatmaps.
* Automated weighbridge hardware integration (serial/IP scale bridges).
* Native mobile money gateways (M-Pesa, Airtel Money, MTN MoMo, Stripe).
* Automated carbon footprint & GHG avoidance accounting.

---

## 3. Technology Stack & Hard Constraints

Every module and component must strictly adhere to the following stack:

* **Framework:** Next.js 16 (App Router only, React 19)
* **Language:** TypeScript 5.x (Strict mode, zero `any` tolerance)
* **Database:** Neon Serverless PostgreSQL
* **ORM:** Drizzle ORM (`drizzle-orm` + `drizzle-kit`)
* **Mutations & Server Logic:** Next.js Server Actions (Zod-validated)
* **Styling:** Tailwind CSS v4 (`@tailwindcss/postcss`) adhering to `DESIGN.md`
* **UI Components:** shadcn/ui (Radix Primitives foundation)
* **Iconography:** React Icons (`react-icons`) as primary; Font Awesome (`@fortawesome/react-fontawesome`) as fallback
* **Typography:** Google Fonts (`Plus Jakarta Sans` for UI, `JetBrains Mono` for telemetry/weights)
* **Animation:**
  * **Framer Motion:** React micro-interactions, page transitions, modal/drawer spring physics
  * **GSAP:** Complex timelines, SVG route paths, multi-step KPI storytelling
* **Media & Documents:** Cloudinary (Weighbridge tickets, bin damage photos, client contracts)
* **Mobile Delivery:** Progressive Web App (PWA) with Service Worker and IndexedDB offline cache

---

## 4. Project Directory & File Organization

The application codebase follows a clean, modular structure centered around domain boundaries:

```text
my-app/
├── app/                                 # Next.js 16 App Router
│   ├── (auth)/                          # Authentication route group
│   │   ├── login/
│   │   └── layout.tsx
│   ├── (dashboard)/                     # Authenticated ERP workspace
│   │   ├── layout.tsx                   # TopBar + Collapsible Sidebar shell
│   │   ├── page.tsx                     # Executive Command Center Dashboard
│   │   ├── clients/                     # Client & Contract CRM
│   │   │   ├── page.tsx                 # Client registry table
│   │   │   ├── [id]/page.tsx            # Client 360 profile
│   │   │   └── new/page.tsx             # Client onboarding wizard
│   │   ├── collections/                 # Waste Collection Jobs
│   │   │   ├── page.tsx                 # Live dispatch & job list
│   │   │   └── [id]/page.tsx            # Digital job sheet & manifest
│   │   ├── routes/                      # Route Management & Maps
│   │   ├── inventory/                   # Recyclable Material & General Stock
│   │   │   ├── recyclables/             # Material flow (PET, HDPE, etc.)
│   │   │   └── consumables/             # PPE, fuel, spare parts
│   │   ├── fleet/                       # Vehicles, Drivers & Assets
│   │   ├── finance/                     # Invoices, Expenses & Projects
│   │   ├── impact/                      # Environmental Diversion & Reports
│   │   └── settings/                    # Multi-country config, tax, users
│   ├── design-system/                   # Interactive Design System Explorer
│   ├── api/                             # Route Handlers (Webhooks, PWA sync ONLY)
│   ├── globals.css                      # Design tokens, variables, Tailwind v4
│   ├── layout.tsx                       # Root layout (fonts, providers)
│   └── manifest.json                    # PWA Web App Manifest
├── components/                          # UI Component Architecture
│   ├── ui/                              # Primitive shadcn/ui components
│   ├── shared/                          # Reusable ERP components (DataTable, StatCard)
│   ├── layout/                          # Sidebar, Header, MobileNav, Breadcrumbs
│   ├── forms/                           # Domain form components with Zod validation
│   └── maps/                            # Map route rendering (SVG / Leaflet / Mapbox)
├── server/                              # Server-side Business Logic
│   ├── actions/                         # Server Actions (Mutations)
│   │   ├── clients.ts
│   │   ├── collections.ts
│   │   ├── inventory.ts
│   │   └── finance.ts
│   ├── db/                              # Database layer
│   │   ├── schema/                      # Modular Drizzle schemas
│   │   │   ├── clients.ts
│   │   │   ├── jobs.ts
│   │   │   ├── inventory.ts
│   │   │   ├── fleet.ts
│   │   │   ├── finance.ts
│   │   │   └── index.ts                 # Export all schemas
│   │   ├── index.ts                     # Neon client + Drizzle instance
│   │   └── migrations/                  # Drizzle migration files
│   └── services/                        # Pure business logic & calculations
│       ├── diversion-calculator.ts      # Environmental diversion math
│       ├── invoice-generator.ts         # Billing calculations
│       └── stock-reconciler.ts          # Material weight shrinkage calculation
├── lib/                                 # Cross-cutting utilities
│   ├── auth/                            # Session, RBAC, permission helpers
│   ├── cloudinary.ts                    # Signed upload & transformation helpers
│   ├── utils.ts                         # cn(), currency & weight formatters
│   └── validators/                      # Shared Zod validation schemas
├── public/                              # Static assets, PWA icons, offline worker
└── types/                               # Global TypeScript ambient definitions
```

---

## 5. Next.js 16 App Router Conventions

### 5.1 Server Components vs. Client Components

1. **Default to Server Components:**
   * Every page (`page.tsx`), layout (`layout.tsx`), and data container MUST be an `async` Server Component by default.
   * Fetch data directly from Neon PostgreSQL using Drizzle ORM inside the Server Component.
   * Pass data down to interactive Client Components as plain serializable props.

2. **Restrict `"use client"` to the Leaves:**
   * Apply `"use client"` exclusively to small, focused interactive components:
     * Segmented filter switches, toggle buttons, modal dialogs, and tabs.
     * Interactive charts (SVG or Canvas rendering).
     * Forms utilizing React state or optimistic UI.
     * Geolocation, camera captures, and PWA service worker listeners.
   * **Never mark an entire page as `"use client"`** just to handle a button click. Wrap the button in a dedicated Client Component.

### 5.2 Server Actions for Mutations

* Mutations (Create, Update, Delete, Transition Status) MUST be implemented using Next.js Server Actions placed in `server/actions/`.
* **Prohibited:** Creating ad-hoc `POST /api/create-client` REST endpoints when a Server Action suffices.
* **Exceptions for Route Handlers (`app/api/`):**
  * Incoming third-party webhooks (e.g., M-Pesa IPN, Stripe webhook, Cloudinary upload notification).
  * Bulk raw CSV export streams.
  * PWA Background Sync worker endpoints.

---

## 6. Server Action Execution Standard

Every Server Action must follow this strict 6-step lifecycle:

```typescript
"use server";

import { z } from "zod";
import { db } from "@/server/db";
import { collectionJobs } from "@/server/db/schema";
import { getCurrentUser, requirePermission } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// 1. Zod Input Schema
const RecordWeightSchema = z.object({
  jobId: z.string().uuid(),
  grossWeightKg: z.number().positive(),
  tareWeightKg: z.number().nonnegative(),
  wasteStream: z.enum(["organic", "recyclable", "residual", "hazardous"]),
  ticketPhotoUrl: z.string().url().optional(),
});

export type ActionState<T> = {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

// 2. Action Function
export async function recordCollectionWeightAction(
  rawInput: unknown
): Promise<ActionState<{ netWeightKg: number }>> {
  try {
    // Step 1: Authentication & Authorization Check
    const user = await getCurrentUser();
    requirePermission(user, "collections:record_weight");

    // Step 2: Server-side Input Validation
    const parsed = RecordWeightSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const { jobId, grossWeightKg, tareWeightKg, wasteStream, ticketPhotoUrl } = parsed.data;
    const netWeightKg = grossWeightKg - tareWeightKg;
    if (netWeightKg <= 0) {
      return { success: false, error: "Gross weight must exceed tare weight." };
    }

    // Step 3: Pure Business Logic / Transaction
    await db.transaction(async (tx) => {
      await tx
        .update(collectionJobs)
        .set({
          actualWeightKg: netWeightKg.toString(),
          status: "delivered",
          ticketPhotoUrl,
          updatedAt: new Date(),
        })
        .where(eq(collectionJobs.id, jobId));

      // Trigger automatic inventory stock-in for recyclables
      // Trigger diversion calculation update
    });

    // Step 4: Revalidation
    revalidatePath(`/collections/${jobId}`);
    revalidatePath("/inventory/recyclables");
    revalidatePath("/");

    // Step 5: Safe Typed Return
    return { success: true, data: { netWeightKg } };
  } catch (error) {
    console.error("[ACTION_ERROR: recordCollectionWeight]", error);
    return { success: false, error: "Une erreur est survenue lors de l'enregistrement de la pesée." };
  }
}
```

---

## 7. Database Architecture: Neon PostgreSQL + Drizzle ORM

### 7.1 Database Engine Rules
* **Host:** Neon Serverless PostgreSQL with connection pooling.
* **Driver:** `@neondatabase/serverless` using WebSocket or HTTP connection pooling for edge compatibility.
* **ORM:** Drizzle ORM. Raw SQL is strictly banned unless benchmarking proves an unoptimizable query.

### 7.2 Naming Conventions
* **Table names:** Plural `snake_case` (e.g., `clients`, `collection_jobs`, `recyclable_inventories`, `vehicles`).
* **Column names:** `snake_case` (e.g., `client_id`, `actual_weight_kg`, `contract_start_date`).
* **Foreign keys:** Suffix with `_id` and specify explicit cascading rules (`references(() => table.id, { onDelete: 'cascade' })`).
* **Amounts & Currency:** Always store monetary values in integers representing the smallest currency unit (e.g., Kenyan Shillings cents, USD cents) OR decimal with explicit scale `decimal("amount", { precision: 12, scale: 2 })`. Never use floating-point types (`real`, `double precision`) for money or legal weights.
* **Weights:** Store in kilograms as `decimal("weight_kg", { precision: 10, scale: 2 })`.

### 7.3 Mandatory Audit Columns
Every primary business table must include:
```typescript
id: uuid("id").defaultRandom().primaryKey(),
createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
isDeleted: boolean("is_deleted").default(false).notNull(), // Soft deletion
deletedAt: timestamp("deleted_at", { withTimezone: true }),
```

### 7.4 Core Drizzle Schema Overview

```typescript
// server/db/schema/clients.ts
export const customerTypeEnum = pgEnum("customer_type", [
  "household",
  "apartment",
  "hotel",
  "restaurant",
  "business",
  "institution",
  "government",
]);

export const clients = pgTable("clients", {
  id: uuid("id").defaultRandom().primaryKey(),
  accountNumber: varchar("account_number", { length: 32 }).unique().notNull(),
  name: text("name").notNull(),
  customerType: customerTypeEnum("customer_type").notNull(),
  contactPerson: text("contact_person"),
  email: text("email"),
  phone: varchar("phone", { length: 32 }).notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  physicalAddress: text("physical_address").notNull(),
  countyRegion: varchar("county_region", { length: 64 }).notNull(),
  collectionFrequency: varchar("collection_frequency", { length: 32 }).notNull(), // daily, weekly, bi-weekly
  contractStartDate: date("contract_start_date"),
  contractEndDate: date("contract_end_date"),
  monthlyFee: decimal("monthly_fee", { precision: 10, scale: 2 }).default("0.00"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  isDeleted: boolean("is_deleted").default(false).notNull(),
});

// server/db/schema/jobs.ts
export const jobStatusEnum = pgEnum("job_status", [
  "scheduled",
  "assigned",
  "in_progress",
  "collected",
  "delivered",
  "completed",
  "missed",
]);

export const collectionJobs = pgTable("collection_jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  jobNumber: varchar("job_number", { length: 32 }).unique().notNull(),
  clientId: uuid("client_id").references(() => clients.id).notNull(),
  routeId: uuid("route_id"),
  vehicleId: uuid("vehicle_id"),
  driverId: uuid("driver_id"),
  wasteStream: varchar("waste_stream", { length: 64 }).notNull(), // organic, recyclable, residual
  expectedQuantityKg: decimal("expected_quantity_kg", { precision: 10, scale: 2 }),
  actualWeightKg: decimal("actual_weight_kg", { precision: 10, scale: 2 }),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
  collectedAt: timestamp("collected_at", { withTimezone: true }),
  status: jobStatusEnum("status").default("scheduled").notNull(),
  gpsLatitude: decimal("gps_latitude", { precision: 10, scale: 7 }),
  gpsLongitude: decimal("gps_longitude", { precision: 10, scale: 7 }),
  proofPhotoUrl: text("proof_photo_url"),
  ticketPhotoUrl: text("ticket_photo_url"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// server/db/schema/inventory.ts
export const materialStageEnum = pgEnum("material_stage", [
  "collected",
  "sorted",
  "stored",
  "processed",
  "sold",
  "transferred",
]);

export const recyclableInventory = pgTable("recyclable_inventory", {
  id: uuid("id").defaultRandom().primaryKey(),
  batchNumber: varchar("batch_number", { length: 32 }).unique().notNull(),
  materialType: varchar("material_type", { length: 32 }).notNull(), // PET, HDPE, LDPE, PP, Cardboard, Glass, Metal, Organic
  gradeQuality: varchar("grade_quality", { length: 32 }).default("Standard"),
  currentWeightKg: decimal("current_weight_kg", { precision: 10, scale: 2 }).notNull(),
  stage: materialStageEnum("stage").default("collected").notNull(),
  storageBay: varchar("storage_bay", { length: 64 }).notNull(),
  intakeJobId: uuid("intake_job_id").references(() => collectionJobs.id),
  buyerId: uuid("buyer_id"),
  unitSellingPrice: decimal("unit_selling_price", { precision: 10, scale: 2 }),
  totalRevenue: decimal("total_revenue", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
```

---

## 8. TypeScript Standards

1. **Zero `any` Policy:**
   * Never use `any`. Use `unknown` with type narrowing, generic constraints, or `z.infer<typeof Schema>`.
2. **Derive Types from Drizzle Schemas:**
   ```typescript
   export type Client = typeof clients.$inferSelect;
   export type NewClient = typeof clients.$inferInsert;
   export type CollectionJob = typeof collectionJobs.$inferSelect;
   ```
3. **Discriminated Unions for Operational States:**
   ```typescript
   export type JobResolution =
     | { status: "collected"; actualWeightKg: number; photoUrl: string }
     | { status: "missed"; reason: "gate_locked" | "access_blocked" | "bin_empty"; notes: string };
   ```

---

## 9. Design System & Styling (Tailwind CSS v4 + shadcn/ui)

All styling must adhere to the rules established in `DESIGN.md`:

### 9.1 Brand Color Palette & Proportions
* **Forest Green (`#00993F`) — ~70%:** Primary brand identity, active navigation pills, primary CTA buttons, confirmed pickups, on-time KPI cards.
* **Solar Amber (`#FECA36`) — ~15%:** Warnings, delays, bin overfill (75–89%), pending weighings, star ratings. Always pair with dark text (`#785608` or `#4D3603`) for WCAG AA compliance.
* **Hydro Cyan (`#08A6BA`) — ~15%:** Telematics, live vehicle pins, GPS routes, in-transit status pills, IoT telemetry, secondary chart series.
* **Canvas Background:** `#F6F8F7` (soft warm off-white).
* **Card Surface:** `#FFFFFF` with `rounded-[20px]` and `border border-[#E3E9E5]`.

### 9.2 Tactile Card & Pill Architecture
* **Dashboard Cards:** Use `.rounded-card` (`border-radius: 20px`) with subtle borders `#E3E9E5` and soft diffuse shadows.
* **Nested Statistic Pills:** Wrap sub-metrics in `.rounded-nested` (`border-radius: 14px`) containers with `#F0F4F2` background.
* **Action & Status Badges:** Use fully rounded capsules (`rounded-full` / `9999px`) with semantic dot indicators.

### 9.3 Iconography Priority
1. **Primary Source:** React Icons (`react-icons/lu` or `react-icons/fi`).
2. **Secondary Source:** Font Awesome (`@fortawesome/react-fontawesome`) when an industry-specific icon (such as a recycling symbol, compactor, or weighbridge scale) is missing in React Icons.
3. **Accessibility:** Never use icons without text unless an `aria-label` or accessible `<span className="sr-only">` is provided.

---

## 10. Animation Guidelines: Framer Motion vs. GSAP

* **Framer Motion:**
  * Use for React UI components, page transitions, accordion collapses, modal dialogs, and slide-over drawers.
  * Always wrap animated lists with `<AnimatePresence mode="popLayout">`.
* **GSAP:**
  * Use exclusively for complex timelines: animated SVG route lines, vehicle paths, scroll-driven recycling storytelling, and multi-stage weighbridge animations.
* **Accessibility Rule:** Always respect user accessibility preferences:
  ```typescript
  // In Framer Motion:
  const shouldReduceMotion = useReducedMotion();
  const transition = shouldReduceMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 30 };
  ```

---

## 11. Cloudinary Media Storage Standard

Waste operations generate thousands of proof-of-collection photos, damaged bin images, and weighbridge paper ticket scans.

* **Never store raw image binary data in PostgreSQL.** Store the Cloudinary Public ID and secure URL.
* **Signed Uploads:** Direct client uploads must use secure, signed upload presets generated by a Server Action (`generateCloudinarySignatureAction`).
* **Automated Transformations:** Deliver responsive, optimized images:
  ```typescript
  export function getOptimizedImageUrl(publicId: string, width = 600) {
    return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_${width},f_auto,q_auto/${publicId}`;
  }
  ```
* **MIME Restrictions:** Allow only `image/jpeg`, `image/png`, `image/webp`, and `application/pdf` for manifests. Maximum file size: `10 MB`.

---

## 12. PWA & Offline-First Field Operations

The core principle states: *"If a waste company can run its daily operations from a phone, the software is doing its job."* In African and emerging-market cities, drivers operate in low-connectivity zones (industrial scrap yards, peri-urban routes, transfer stations).

### Offline Requirements for Field Teams
1. **Route Caching:** At the start of a shift, the driver's mobile PWA downloads today's scheduled route and client manifest to local **IndexedDB**.
2. **Offline Data Capture:** Drivers can record actual weight, capture GPS coordinates, take photos, and mark jobs as `Collected` without an active internet connection.
3. **Background Sync:** The Service Worker queues offline mutations in IndexedDB. Once connectivity is restored, the queue replays Server Actions sequentially to synchronize with Neon PostgreSQL.
4. **Visual Sync Indicator:** A persistent pill badge in the mobile header indicates sync status:
   * Green dot: *"En ligne — Synchronisé"*
   * Amber pulse: *"3 collectes en attente de synchronisation"*

---

## 13. Authentication & Role-Based Access Control (RBAC)

Rafiki WasteOS enforces strict server-side authorization boundaries. Never rely on simply hiding a button in the UI.

### Defined Roles

| Role | Scope & Permissions |
| :--- | :--- |
| **Super Admin** | Multi-tenant administration, billing subscriptions, system diagnostics. |
| **Company Admin** | Organization settings, user invitations, company accounting, contract approvals. |
| **Operations Manager**| Full route creation, driver dispatch, weighbridge reconciliations, compliance. |
| **Dispatcher** | Daily collection assignment, route monitoring, customer complaint handling. |
| **Driver / Field Worker**| Restricted mobile view: assigned routes, start/complete jobs, weigh & photo capture. No financial data. |
| **Warehouse / Facility Officer**| Material sorting intake, stock-in/stock-out, baler processing, scrap sales. |
| **Finance Officer** | Invoices, receipts, expense approvals, payment tracking, P&L generation. |
| **Client** | Read-only customer portal: view collection schedule, request pickup, download invoice & impact certificates. |

---

## 14. Environmental Impact & Diversion Math

A key market differentiator of Rafiki WasteOS is automated sustainability and diversion reporting:

$$\text{Diversion Rate (\%)} = \left( \frac{\text{Weight Recycled} + \text{Weight Composted} + \text{Weight Reused}}{\text{Total Waste Collected}} \right) \times 100$$

### Automated Customer Certificate Output
Every month, the system generates a branded, downloadable customer report (e.g., *"ABC Hotel — Monthly Waste Recovery Report"*):
* Total waste collected (tonnes)
* Breakdown: Recyclables (PET, Cardboard, Glass), Organic Compost, Residual to Landfill
* Landfill Diversion Rate (%)
* Estimated GHG Emissions Avoided (using IPCC / EPA WARM conversion factors)

---

## 15. Error Handling, Loading & Empty States

* **Loading States:** Every data-fetching page must have a corresponding `loading.tsx` containing skeleton cards that mirror the exact geometry of the loaded page (using `rounded-[20px]`).
* **Empty States:** When a route, client list, or inventory bay has no records, display a tactile empty card featuring a clear explanation and an immediate primary CTA (e.g., `+ Planifier une première tournée`).
* **Error Boundaries:** Provide `error.tsx` at route segment boundaries with safe user-friendly explanations and a `"Réessayer"` retry trigger.

---

## 16. Security & Environment Variables

### Environment Classification
```bash
# Server-only (NEVER expose to client)
DATABASE_URL=postgresql://user:pass@ep-xyz.neon.tech/neondb?sslmode=require
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
AUTH_SECRET=...

# Public (NEXT_PUBLIC_ prefix allowed)
NEXT_PUBLIC_APP_URL=https://app.rafikiwaste.com
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
```

* AI agents must check that database credentials and API secrets are never imported into files marked `"use client"`.
* Sanitize all inputs against SQL injection and XSS through Drizzle parameterized queries and Zod schemas.

---

## 17. AI Coding Agent Operational Directives

When assigned a task on Rafiki WasteOS, AI coding agents must follow this sequential protocol:

### Step 1: Pre-Execution Discovery
1. Read `AGENTS.md` and [DESIGN.md](file:///c:/Users/HomePC/Desktop/my%20things/Antigravity/rafikiWasteOS/DESIGN.md).
2. Inspect the relevant existing schemas in `server/db/schema/` and components in `components/`.
3. Check if the requested feature belongs to Phase 1 (MVP), Phase 2, or Phase 3.
4. Verify if reusable components (e.g., `DataTable`, `StatCard`, `Badge`) already exist before writing new ones.

### Step 2: Implementation Discipline
1. Build Server Components by default; keep Client Components at the interactive leaves.
2. Implement mutations via Zod-validated Server Actions with authentication checks.
3. Adhere to the `70 / 15 / 15` brand color ratio and rounded card language (`rounded-[20px]`).
4. Ensure numerical readouts have units (`kg`, `t`, `km`, `KES`, `€`).
5. Account for offline field realities and mobile responsiveness on all worker-facing screens.

### Step 3: Post-Implementation Verification
1. Run TypeScript validation (`tsc --noEmit` or Next.js build check).
2. Check for missing loading skeletons or unhandled empty states.
3. Verify WCAG AA color contrast (especially ensuring Solar Amber `#FECA36` is paired with dark text).
4. Summarize changes clearly, highlighting database schema migrations and architectural additions.
