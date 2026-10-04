import {
  pgTable,
  uuid,
  varchar,
  text,
  decimal,
  timestamp,
  integer,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { clients } from "./clients";
import { routes } from "./routes";
import { vehicles } from "./fleet";

export const jobStatusEnum = pgEnum("job_status", [
  "scheduled",
  "assigned",
  "in_progress",
  "collected",
  "delivered",
  "completed",
  "missed",
]);

export const wasteStreamEnum = pgEnum("waste_stream", [
  "organic",
  "recyclable",
  "residual",
  "hazardous",
  "electronic",
]);

export const missedReasonEnum = pgEnum("missed_reason", [
  "gate_locked",
  "access_blocked",
  "bin_empty",
  "client_not_ready",
  "severe_weather",
  "vehicle_breakdown",
  "other",
]);

export const collectionJobs = pgTable("collection_jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  jobNumber: varchar("job_number", { length: 32 }).unique().notNull(), // e.g. JOB-2026-0412
  clientId: uuid("client_id")
    .references(() => clients.id, { onDelete: "cascade" })
    .notNull(),
  routeId: uuid("route_id").references(() => routes.id, { onDelete: "set null" }),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id, { onDelete: "set null" }),
  driverName: varchar("driver_name", { length: 128 }),
  wasteStream: wasteStreamEnum("waste_stream").notNull().default("recyclable"),
  stopSequence: integer("stop_sequence").default(1).notNull(),
  expectedQuantityKg: decimal("expected_quantity_kg", { precision: 10, scale: 2 }).default("0.00"),
  grossWeightKg: decimal("gross_weight_kg", { precision: 10, scale: 2 }),
  tareWeightKg: decimal("tare_weight_kg", { precision: 10, scale: 2 }),
  actualWeightKg: decimal("actual_weight_kg", { precision: 10, scale: 2 }), // Net weight = gross - tare
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
  collectedAt: timestamp("collected_at", { withTimezone: true }),
  deliveredAt: timestamp("delivered_at", { withTimezone: true }),
  status: jobStatusEnum("status").default("scheduled").notNull(),
  missedReason: missedReasonEnum("missed_reason"),
  gpsLatitude: decimal("gps_latitude", { precision: 10, scale: 7 }),
  gpsLongitude: decimal("gps_longitude", { precision: 10, scale: 7 }),
  proofPhotoUrl: text("proof_photo_url"),
  ticketPhotoUrl: text("ticket_photo_url"),
  binCondition: varchar("bin_condition", { length: 32 }).default("Normal"), // Normal, Damaged, Overfilled, Contaminated
  clientSignatureName: varchar("client_signature_name", { length: 128 }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export type CollectionJob = typeof collectionJobs.$inferSelect;
export type NewCollectionJob = typeof collectionJobs.$inferInsert;
