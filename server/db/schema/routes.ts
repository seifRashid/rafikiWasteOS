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
import { vehicles } from "./fleet";

export const routeStatusEnum = pgEnum("route_status", [
  "planned",
  "in_progress",
  "completed",
  "cancelled",
]);

export const routes = pgTable("routes", {
  id: uuid("id").defaultRandom().primaryKey(),
  routeCode: varchar("route_code", { length: 32 }).unique().notNull(), // e.g. RT-NAI-01
  name: text("name").notNull(), // e.g. "Westlands Commercial & Hotel Loop"
  vehicleId: uuid("vehicle_id").references(() => vehicles.id, { onDelete: "set null" }),
  driverName: varchar("driver_name", { length: 128 }).notNull(),
  driverPhone: varchar("driver_phone", { length: 32 }),
  crewNames: text("crew_names"), // Helper staff
  routeDate: date("route_date").notNull(),
  status: routeStatusEnum("status").default("planned").notNull(),
  totalStops: integer("total_stops").default(0).notNull(),
  completedStops: integer("completed_stops").default(0).notNull(),
  totalDistanceKm: decimal("total_distance_km", { precision: 8, scale: 2 }).default("0.00"),
  fuelUsedLitres: decimal("fuel_used_litres", { precision: 8, scale: 2 }).default("0.00"),
  startDepot: text("start_depot").default("Central Logistics Depot"),
  endDestination: text("end_destination").default("Mombasa Road MRF & Composting Facility"),
  waypointsJson: text("waypoints_json"), // Coordinates & stop sequence metadata
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export type Route = typeof routes.$inferSelect;
export type NewRoute = typeof routes.$inferInsert;

export const dispatchSettings = pgTable("dispatch_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  maxStopsPerRoute: integer("max_stops_per_route").default(8).notNull(),
  autoSplitExceededRoutes: boolean("auto_split_exceeded_routes").default(true).notNull(),
  defaultStartDepot: text("default_start_depot").default("Central Logistics Depot").notNull(),
  defaultEndDestination: text("default_end_destination").default("Mombasa Road MRF & Weighbridge").notNull(),
  operatingDays: text("operating_days").default("Monday,Tuesday,Wednesday,Thursday,Friday,Saturday"),
  updatedBy: text("updated_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type DispatchSetting = typeof dispatchSettings.$inferSelect;
export type NewDispatchSetting = typeof dispatchSettings.$inferInsert;
