import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

export const containerTypes = pgTable("container_types", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: varchar("code", { length: 32 }).unique().notNull(), // e.g. BIN-240L, BIN-1100L, SKP-10M3, CAG-BAL
  name: varchar("name", { length: 128 }).notNull(), // e.g. 240L Heavy-Duty Wheeled Bin
  category: varchar("category", { length: 64 }).notNull(), // Wheeled Bin, Eurobin, Industrial Skip, Stationary Compactor, Storage Cage
  capacityLitres: integer("capacity_litres").notNull(), // e.g. 240, 1100, 10000, 1500
  compatibleStream: varchar("compatible_stream", { length: 64 }).default("All Streams").notNull(), // organic, recyclable, residual, or all
  totalStock: integer("total_stock").default(0).notNull(), // Total units owned by company
  colorCode: varchar("color_code", { length: 32 }).default("#00993F").notNull(), // Distinct visual color
  rfidTracked: boolean("rfid_tracked").default(true).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export type ContainerType = typeof containerTypes.$inferSelect;
export type NewContainerType = typeof containerTypes.$inferInsert;
