import { createNeonAuth } from "@neondatabase/auth/next/server";
import { db } from "@/server/db";
import { users, clients } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET || "rafiki_wasteos_auth_cookie_secret_key_938472910482_emerging_market",
    sessionDataTtl: 300,
  },
});

export type AuthSessionUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  role?: string | null;
};

export type FullUserProfile = {
  authUserId: string;
  appUserId?: string;
  clientId?: string | null;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  roleTitle: string;
  status: "active" | "invited" | "pending_approval" | "suspended" | "inactive";
  depotLocation?: string | null;
  assignedVehiclePlate?: string | null;
  avatarUrl?: string | null;
  permissions?: string[];
  isAdmin: boolean;
  isApproved: boolean;
  isClient: boolean;
  isClientActive?: boolean;
};

/**
 * Retrieves the current session and correlated application user record from PostgreSQL
 */
export async function getCurrentUser(): Promise<FullUserProfile | null> {
  try {
    const { data: session } = await auth.getSession();
    if (!session?.user || !session.user.email) {
      return null;
    }

    const authUser = session.user as AuthSessionUser;

    // Look up application user record in PostgreSQL
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, authUser.email))
      .limit(1);

    if (existing.length > 0) {
      const appUser = existing[0];
      const isAdmin = appUser.role === "super_admin";
      const isClient = appUser.role === "client_admin" || appUser.role === "client_user";

      // If user is tied to a client organization, verify client active status
      let isClientActive = true;
      if (appUser.clientId) {
        try {
          const [clientOrg] = await db
            .select({
              isActive: clients.isActive,
              isDeleted: clients.isDeleted,
              contractEndDate: clients.contractEndDate,
            })
            .from(clients)
            .where(eq(clients.id, appUser.clientId))
            .limit(1);

          if (clientOrg) {
            const todayStr = new Date().toISOString().split("T")[0];
            const isExpired = Boolean(clientOrg.contractEndDate && clientOrg.contractEndDate < todayStr);
            isClientActive = Boolean(clientOrg.isActive && !clientOrg.isDeleted && !isExpired);
          } else {
            isClientActive = false;
          }
        } catch (e) {
          console.warn("[getCurrentUser client lookup notice]:", e);
        }
      }

      // An approved client user must have an active user status AND an active client organization
      const isApproved = appUser.status === "active" && (!isClient || isClientActive);

      return {
        authUserId: authUser.id,
        appUserId: appUser.id,
        clientId: appUser.clientId,
        fullName: appUser.fullName || authUser.name,
        email: appUser.email,
        phone: appUser.phone,
        role: appUser.role,
        roleTitle: appUser.roleTitle,
        status: !isClientActive ? "inactive" : appUser.status,
        depotLocation: appUser.depotLocation,
        assignedVehiclePlate: appUser.assignedVehiclePlate,
        avatarUrl: appUser.avatarUrl || authUser.image,
        permissions: (appUser.customPermissions as string[]) || [],
        isAdmin,
        isApproved,
        isClient,
        isClientActive,
      };
    }

    // If registered via Neon Auth but not yet in domain table, return pending approval
    return {
      authUserId: authUser.id,
      fullName: authUser.name,
      email: authUser.email,
      role: "unassigned",
      roleTitle: "Pending Role Assignment",
      status: "pending_approval",
      isAdmin: false,
      isApproved: false,
      isClient: false,
    };
  } catch (error) {
    console.error("[getCurrentUser Error]:", error);
    return null;
  }
}

/**
 * Enforces client authorization and returns the client context.
 * Throws or returns null if not authenticated as a valid active client user.
 */
export async function requireClientUser(): Promise<{ user: FullUserProfile; clientId: string } | null> {
  const user = await getCurrentUser();
  if (!user || !user.isApproved) {
    return null;
  }
  if (!user.isClient || !user.clientId) {
    // If super_admin is inspecting or previewing, handle gracefully or require explicit client
    return null;
  }
  return { user, clientId: user.clientId };
}
