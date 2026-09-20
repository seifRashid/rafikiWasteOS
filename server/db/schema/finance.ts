import {
  pgTable,
  uuid,
  varchar,
  text,
  decimal,
  date,
  timestamp,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { clients } from "./clients";
import { vehicles } from "./fleet";

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "draft",
  "pending",
  "paid",
  "overdue",
  "cancelled",
]);

export const expenseCategoryEnum = pgEnum("expense_category", [
  "fuel",
  "salaries_wages",
  "vehicle_maintenance",
  "ppe_safety",
  "depot_rent_utilities",
  "licences_compliance",
  "spare_parts",
  "other_operational",
]);

export const projectStatusEnum = pgEnum("project_status", [
  "active",
  "completed",
  "planning",
  "on_hold",
]);

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectCode: varchar("project_code", { length: 32 }).unique().notNull(), // e.g. PRJ-MSA-2026
  name: text("name").notNull(), // e.g. "Mombasa Marine Plastic Interceptor & Recycling Initiative"
  donorPartner: varchar("donor_partner", { length: 128 }).notNull(), // e.g. "USAID Clean Oceans / Alliance to End Plastic Waste"
  budgetAmount: decimal("budget_amount", { precision: 14, scale: 2 }).notNull(),
  spentAmount: decimal("spent_amount", { precision: 14, scale: 2 }).default("0.00").notNull(),
  targetTonnage: decimal("target_tonnage", { precision: 10, scale: 2 }).notNull(),
  recoveredTonnage: decimal("recovered_tonnage", { precision: 10, scale: 2 }).default("0.00").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  status: projectStatusEnum("status").default("active").notNull(),
  beneficiariesCount: varchar("beneficiaries_count", { length: 64 }).default("140 Informal Waste Pickers"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const invoices = pgTable("invoices", {
  id: uuid("id").defaultRandom().primaryKey(),
  invoiceNumber: varchar("invoice_number", { length: 32 }).unique().notNull(), // e.g. INV-2026-0042
  clientId: uuid("client_id")
    .references(() => clients.id, { onDelete: "cascade" })
    .notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 8 }).default("KES").notNull(),
  status: invoiceStatusEnum("status").default("pending").notNull(),
  billingPeriod: varchar("billing_period", { length: 64 }).notNull(), // e.g. "September 2026"
  issueDate: date("issue_date").notNull(),
  dueDate: date("due_date").notNull(),
  paidDate: date("paid_date"),
  paymentMethod: varchar("payment_method", { length: 64 }), // M-Pesa Till / Bank Wire / Cash
  paymentReference: varchar("payment_reference", { length: 64 }), // e.g. QK8912LX99
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const expenses = pgTable("expenses", {
  id: uuid("id").defaultRandom().primaryKey(),
  expenseCode: varchar("expense_code", { length: 32 }).unique().notNull(), // e.g. EXP-2026-018
  category: expenseCategoryEnum("category").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 8 }).default("KES").notNull(),
  description: text("description").notNull(),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id, { onDelete: "set null" }),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
  expenseDate: date("expense_date").notNull(),
  receiptPhotoUrl: text("receipt_photo_url"),
  paidTo: varchar("paid_to", { length: 128 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
