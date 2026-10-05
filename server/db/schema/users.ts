import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  pgEnum,
  jsonb,
} from "drizzle-orm/pg-core";

export const systemRoleEnum = pgEnum("system_role", [
  "super_admin",
  "operations_manager",
  "finance_officer",
  "mrf_operator",
  "fleet_supervisor",
  "driver_collector",
  "esg_auditor",
  "client_admin",
  "client_user",
  "custom",
  "unassigned",
]);

export const userStatusEnum = pgEnum("user_status", [
  "active",
  "invited",
  "pending_approval",
  "suspended",
  "inactive",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  authUserId: text("auth_user_id"),
  clientId: uuid("client_id"), // Correlates client users with clients table (defined as nullable for staff)
  fullName: varchar("full_name", { length: 128 }).notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  phone: varchar("phone", { length: 32 }).notNull(),
  role: systemRoleEnum("role").default("unassigned").notNull(),
  roleTitle: varchar("role_title", { length: 64 }).default("Pending Role Assignment").notNull(),
  status: userStatusEnum("status").default("pending_approval").notNull(),
  avatarUrl: text("avatar_url"),
  depotLocation: varchar("depot_location", { length: 128 }).default("Central Transfer Station"),
  assignedVehiclePlate: varchar("assigned_vehicle_plate", { length: 32 }),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  lastLoginIp: varchar("last_login_ip", { length: 45 }),
  twoFactorEnabled: boolean("two_factor_enabled").default(false).notNull(),
  customPermissions: jsonb("custom_permissions").$type<string[]>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  isDeleted: boolean("is_deleted").default(false).notNull(),
});

export const roles = pgTable("roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 64 }).unique().notNull(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description").notNull(),
  badgeColor: varchar("badge_color", { length: 32 }).default("#00993F").notNull(),
  permissions: jsonb("permissions").$type<string[]>().notNull(),
  isSystem: boolean("is_system").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type SystemUser = typeof users.$inferSelect;
export type NewSystemUser = typeof users.$inferInsert;
export type SystemRole = typeof roles.$inferSelect;
export type NewSystemRole = typeof roles.$inferInsert;
