import {
  pgTable,
  uuid,
  varchar,
  text,
  decimal,
  timestamp,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { collectionJobs } from "./jobs";

export const materialStageEnum = pgEnum("material_stage", [
  "collected",
  "sorted",
  "stored",
  "processed",
  "sold",
  "transferred",
]);

export const materialTypeEnum = pgEnum("material_type", [
  "pet_plastic",
  "hdpe_plastic",
  "ldpe_film",
  "pp_polypropylene",
  "cardboard_occ",
  "mixed_paper",
  "aluminium_cans",
  "steel_scrap",
  "glass_cullet",
  "organic_compost",
  "electronic_waste",
]);

export const recyclableInventory = pgTable("recyclable_inventory", {
  id: uuid("id").defaultRandom().primaryKey(),
  batchNumber: varchar("batch_number", { length: 32 }).unique().notNull(), // e.g. BAT-PET-2026-089
  materialType: materialTypeEnum("material_type").notNull(),
  gradeQuality: varchar("grade_quality", { length: 32 }).default("Standard").notNull(), // Grade A (Clear), Grade B, Baled, Flaked
  collectedWeightKg: decimal("collected_weight_kg", { precision: 10, scale: 2 }).notNull(),
  sortedWeightKg: decimal("sorted_weight_kg", { precision: 10, scale: 2 }),
  rejectedWeightKg: decimal("rejected_weight_kg", { precision: 10, scale: 2 }).default("0.00"), // Sorting shrinkage
  currentWeightKg: decimal("current_weight_kg", { precision: 10, scale: 2 }).notNull(),
  stage: materialStageEnum("stage").default("collected").notNull(),
  storageBay: varchar("storage_bay", { length: 64 }).notNull(), // Bay 01 - Baled PET, Bay 04 - Corrugated
  intakeJobId: uuid("intake_job_id").references(() => collectionJobs.id, { onDelete: "set null" }),
  buyerName: varchar("buyer_name", { length: 128 }),
  unitSellingPrice: decimal("unit_selling_price", { precision: 10, scale: 2 }), // KES per kg
  totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export type RecyclableInventory = typeof recyclableInventory.$inferSelect;
export type NewRecyclableInventory = typeof recyclableInventory.$inferInsert;
