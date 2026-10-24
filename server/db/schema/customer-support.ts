import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  date,
} from "drizzle-orm/pg-core";
import { clients } from "./clients";

export const customerRequests = pgTable("customer_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  ticketNumber: varchar("ticket_number", { length: 32 }).unique().notNull(),
  clientId: uuid("client_id")
    .references(() => clients.id, { onDelete: "cascade" })
    .notNull(),
  type: varchar("type", { length: 128 }).notNull(),
  subject: text("subject").notNull(),
  details: text("details").notNull(),
  priority: varchar("priority", { length: 32 }).default("normal").notNull(),
  status: varchar("status", { length: 32 }).default("pending").notNull(),
  preferredDate: date("preferred_date"),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  isDeleted: boolean("is_deleted").default(false).notNull(),
});

export const customerComplaints = pgTable("customer_complaints", {
  id: uuid("id").defaultRandom().primaryKey(),
  ticketNumber: varchar("ticket_number", { length: 32 }).unique().notNull(),
  clientId: uuid("client_id")
    .references(() => clients.id, { onDelete: "cascade" })
    .notNull(),
  category: varchar("category", { length: 128 }).notNull(),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  priority: varchar("priority", { length: 32 }).default("medium").notNull(),
  status: varchar("status", { length: 32 }).default("open").notNull(),
  assignedTo: text("assigned_to"),
  resolutionNotes: text("resolution_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  isDeleted: boolean("is_deleted").default(false).notNull(),
});

export type CustomerRequest = typeof customerRequests.$inferSelect;
export type NewCustomerRequest = typeof customerRequests.$inferInsert;
export type CustomerComplaint = typeof customerComplaints.$inferSelect;
export type NewCustomerComplaint = typeof customerComplaints.$inferInsert;
