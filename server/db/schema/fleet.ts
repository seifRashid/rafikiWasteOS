import {
  pgTable,
  uuid,
  varchar,
  text,
  decimal,
  date,
  integer,
  boolean,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

export const vehicleTypeEnum = pgEnum("vehicle_type", [
  "compactor_truck",
  "flatbed_truck",
  "skip_loader",
  "tuk_tuk_cargo",
  "pickup_utility",
  "handcart_crew",
]);

export const vehicleStatusEnum = pgEnum("vehicle_status", [
  "active",
  "in_transit",
  "maintenance",
  "idle",
  "decommissioned",
]);

export const vehicles = pgTable("vehicles", {
  id: uuid("id").defaultRandom().primaryKey(),
  plateNumber: varchar("plate_number", { length: 32 }).unique().notNull(), // e.g. KDD 482B
  model: varchar("model", { length: 64 }).notNull(), // e.g. Isuzu FVZ 1400 Rear Loader
  type: vehicleTypeEnum("type").notNull(),
  capacityKg: decimal("capacity_kg", { precision: 10, scale: 2 }).notNull(), // e.g. 10,000 kg
  currentMileageKm: integer("current_mileage_km").default(0).notNull(),
  nextServiceKm: integer("next_service_km").notNull(),
  assignedDriverName: varchar("assigned_driver_name", { length: 128 }),
  assignedDriverPhone: varchar("assigned_driver_phone", { length: 32 }),
  fuelLevelPercent: integer("fuel_level_percent").default(100),
  status: vehicleStatusEnum("status").default("active").notNull(),
  insuranceExpiryDate: date("insurance_expiry_date"),
  inspectionExpiryDate: date("inspection_expiry_date"),
  depotLocation: varchar("depot_location", { length: 128 }).default("Central Transfer Station"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const assetCategoryEnum = pgEnum("asset_category", [
  "wheeled_bin_240l",
  "wheeled_bin_1100l",
  "static_compactor",
  "weighbridge_scale",
  "baling_press",
  "shredder",
]);

export const assets = pgTable("assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  assetTag: varchar("asset_tag", { length: 32 }).unique().notNull(), // e.g. BIN-240-0891
  name: varchar("name", { length: 128 }).notNull(),
  category: assetCategoryEnum("category").notNull(),
  location: text("location").notNull(), // Client site, yard, depot
  assignedClientId: uuid("assigned_client_id"),
  condition: varchar("condition", { length: 32 }).default("Good"), // Excellent, Good, Fair, Damaged
  purchaseDate: date("purchase_date"),
  purchaseCost: decimal("purchase_cost", { precision: 12, scale: 2 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export type Vehicle = typeof vehicles.$inferSelect;
export type NewVehicle = typeof vehicles.$inferInsert;
export type Asset = typeof assets.$inferSelect;
export type NewAsset = typeof assets.$inferInsert;
