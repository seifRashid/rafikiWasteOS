import {
  pgTable,
  uuid,
  varchar,
  text,
  decimal,
  date,
  boolean,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

export const customerTypeEnum = pgEnum("customer_type", [
  "household",
  "apartment",
  "hotel",
  "restaurant",
  "business",
  "school",
  "institution",
  "government",
]);

export const collectionFrequencyEnum = pgEnum("collection_frequency", [
  "daily",
  "twice_weekly",
  "weekly",
  "bi_weekly",
  "monthly",
  "on_demand",
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
  countyRegion: varchar("county_region", { length: 64 }).notNull(), // Nairobi, Mombasa, Kisumu, Nakuru, etc.
  collectionFrequency: collectionFrequencyEnum("collection_frequency").notNull().default("weekly"),
  wasteStreams: text("waste_streams").notNull().default("Organic, Recyclable"), // Comma-separated or descriptor
  binCount: varchar("bin_count", { length: 32 }).default("2 x 240L Wheeled Bins"),
  contractStartDate: date("contract_start_date"),
  contractEndDate: date("contract_end_date"),
  monthlyFee: decimal("monthly_fee", { precision: 12, scale: 2 }).default("0.00"),
  currency: varchar("currency", { length: 8 }).default("KES").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
