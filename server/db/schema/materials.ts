import {
  pgTable,
  uuid,
  varchar,
  text,
  decimal,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

export const wasteMaterials = pgTable("waste_materials", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: varchar("code", { length: 32 }).unique().notNull(), // e.g. PET-CLR, HDP-RGD
  name: varchar("name", { length: 128 }).notNull(), // e.g. PET Clear Bottles
  category: varchar("category", { length: 64 }).notNull(), // e.g. Rigid Plastic, Paper & Fibre
  wasteStream: varchar("waste_stream", { length: 32 }).default("recyclable").notNull(), // organic, recyclable, residual, hazardous, electronic
  benchmarkPrice: decimal("benchmark_price", { precision: 10, scale: 2 }).notNull(), // KES per kg
  baleDensity: varchar("bale_density", { length: 128 }).notNull(), // e.g. 220 - 250 kg/bale
  acceptable: text("acceptable").notNull(), // e.g. Clear water and beverage bottles, sorted caps
  rejects: text("rejects").notNull(), // e.g. Opaque bottles, motor oil containers, PVC labels
  isVerified: boolean("is_verified").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export type WasteMaterial = typeof wasteMaterials.$inferSelect;
export type NewWasteMaterial = typeof wasteMaterials.$inferInsert;
