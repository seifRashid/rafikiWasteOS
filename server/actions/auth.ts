"use server";

import { z } from "zod";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/server";
import { revalidatePath } from "next/cache";

const RegisterNormalUserSchema = z.object({
  authUserId: z.string().optional(),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(7, "Valid phone number required"),
  depotLocation: z.string().default("Central Transfer Station"),
});

const RegisterAdminUserSchema = z.object({
  authUserId: z.string().optional(),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(7, "Valid phone number required"),
  adminKey: z.string().min(1, "Admin verification key is required"),
  depotLocation: z.string().default("Executive HQ"),
});

const ApproveUserSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  role: z.enum([
    "super_admin",
    "operations_manager",
    "finance_officer",
    "mrf_operator",
    "fleet_supervisor",
    "driver_collector",
    "esg_auditor",
    "custom",
  ]),
  roleTitle: z.string().min(2, "Role title is required"),
  depotLocation: z.string().min(2, "Depot location is required"),
  assignedVehiclePlate: z.string().optional(),
});

export type ActionState<T> = {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

/**
 * Register a normal staff account. The user will be created with `pending_approval`
 * and cannot access system modules until approved and assigned a role by an admin.
 */
export async function registerNormalUserAction(
  rawInput: unknown
): Promise<ActionState<{ id: string; status: string }>> {
  try {
    const parsed = RegisterNormalUserSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const { authUserId, fullName, email, phone, depotLocation } = parsed.data;

    // Check if user record already exists
    const existing = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim())).limit(1);

    if (existing.length > 0) {
      // If already exists, ensure authUserId is saved
      if (authUserId && !existing[0].authUserId) {
        await db.update(users).set({ authUserId, updatedAt: new Date() }).where(eq(users.id, existing[0].id));
      }
      return {
        success: true,
        data: { id: existing[0].id, status: existing[0].status },
      };
    }

    const [newUser] = await db
      .insert(users)
      .values({
        authUserId,
        fullName,
        email: email.toLowerCase().trim(),
        phone,
        role: "unassigned",
        roleTitle: "Pending Role Assignment",
        status: "pending_approval",
        depotLocation,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning({ id: users.id, status: users.status });

    revalidatePath("/settings/users");
    return { success: true, data: { id: newUser.id, status: newUser.status } };
  } catch (error) {
    console.error("[registerNormalUserAction Error]:", error);
    return { success: false, error: "Failed to create user profile record." };
  }
}

/**
 * Register an administrator account. Requires the verified administrative authorization key.
 */
export async function registerAdminUserAction(
  rawInput: unknown
): Promise<ActionState<{ id: string; role: string }>> {
  try {
    const parsed = RegisterAdminUserSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const { authUserId, fullName, email, phone, adminKey, depotLocation } = parsed.data;

    const expectedAdminKey = process.env.ADMIN_INVITE_KEY || "RAFIKI-ADMIN-2026";
    if (adminKey !== expectedAdminKey) {
      return {
        success: false,
        error: "Invalid Administrator Verification Key. Contact executive management for authorization.",
      };
    }

    const existing = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim())).limit(1);

    if (existing.length > 0) {
      await db
        .update(users)
        .set({
          role: "super_admin",
          roleTitle: "Super Administrator",
          status: "active",
          authUserId: authUserId || existing[0].authUserId,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existing[0].id));

      revalidatePath("/settings/users");
      return { success: true, data: { id: existing[0].id, role: "super_admin" } };
    }

    const [newAdmin] = await db
      .insert(users)
      .values({
        authUserId,
        fullName,
        email: email.toLowerCase().trim(),
        phone,
        role: "super_admin",
        roleTitle: "Super Administrator",
        status: "active",
        depotLocation,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning({ id: users.id, role: users.role });

    revalidatePath("/settings/users");
    return { success: true, data: { id: newAdmin.id, role: newAdmin.role } };
  } catch (error) {
    console.error("[registerAdminUserAction Error]:", error);
    return { success: false, error: "Failed to register administrator account." };
  }
}

/**
 * Admin action: Approve a user, assign their role, depot, and vehicle.
 */
export async function approveUserAction(
  rawInput: unknown
): Promise<ActionState<{ userId: string; role: string }>> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.isAdmin) {
      return {
        success: false,
        error: "Unauthorized: Administrator privileges are required to approve users.",
      };
    }

    const parsed = ApproveUserSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const { userId, role, roleTitle, depotLocation, assignedVehiclePlate } = parsed.data;

    await db
      .update(users)
      .set({
        role,
        roleTitle,
        depotLocation,
        assignedVehiclePlate: assignedVehiclePlate || null,
        status: "active",
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    revalidatePath("/settings/users");
    revalidatePath("/");

    return { success: true, data: { userId, role } };
  } catch (error) {
    console.error("[approveUserAction Error]:", error);
    return { success: false, error: "Failed to approve user." };
  }
}

/**
 * Admin action: Suspend or deactivate a user account.
 */
export async function suspendUserAction(
  userId: string
): Promise<ActionState<{ userId: string }>> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.isAdmin) {
      return {
        success: false,
        error: "Unauthorized: Administrator privileges are required.",
      };
    }

    await db
      .update(users)
      .set({
        status: "suspended",
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    revalidatePath("/settings/users");
    return { success: true, data: { userId } };
  } catch (error) {
    console.error("[suspendUserAction Error]:", error);
    return { success: false, error: "Failed to suspend user account." };
  }
}

/**
 * Check if the currently authenticated user is approved.
 */
export async function checkApprovalStatusAction(): Promise<{
  authenticated: boolean;
  status?: string;
  role?: string;
  email?: string;
  fullName?: string;
}> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { authenticated: false };
    }
    return {
      authenticated: true,
      status: user.status,
      role: user.role,
      email: user.email,
      fullName: user.fullName,
    };
  } catch (error) {
    console.error("[checkApprovalStatusAction Error]:", error);
    return { authenticated: false };
  }
}
