import { db } from "@/server/db";
import { clients, users, collectionJobs } from "@/server/db/schema";
import { eq, and, isNotNull, lt, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface DeactivationResult {
  deactivatedCount: number;
  deactivatedClientIds: string[];
  processedAt: string;
}

/**
 * Automatically inspects all client contracts and deactivates any clients
 * whose contract end date has expired (contractEndDate < today).
 *
 * Operational integrity:
 * - Updates client isActive to false.
 * - Deactivates client portal users (status = 'inactive').
 * - Cancels future uncollected scheduled jobs.
 * - PRESERVES all historical jobs (completed, delivered, collected), weighbridge records, and invoices!
 */
export async function deactivateExpiredContractsService(): Promise<DeactivationResult> {
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0]; // YYYY-MM-DD

  try {
    // 1. Find all active, non-deleted clients with expired contractEndDate
    const expiredClients = await db
      .select({
        id: clients.id,
        name: clients.name,
        accountNumber: clients.accountNumber,
        contractEndDate: clients.contractEndDate,
      })
      .from(clients)
      .where(
        and(
          eq(clients.isActive, true),
          eq(clients.isDeleted, false),
          isNotNull(clients.contractEndDate),
          lt(clients.contractEndDate, todayStr)
        )
      );

    if (expiredClients.length === 0) {
      return {
        deactivatedCount: 0,
        deactivatedClientIds: [],
        processedAt: now.toISOString(),
      };
    }

    const deactivatedClientIds: string[] = [];

    // 2. Process deactivation for each expired client
    for (const client of expiredClients) {
      deactivatedClientIds.push(client.id);

      // Deactivate client in clients table
      await db
        .update(clients)
        .set({
          isActive: false,
          updatedAt: now,
          notes: sql`CONCAT(COALESCE(${clients.notes}, ''), ' [Auto-deactivated: Contract expired on ', ${client.contractEndDate}::text, ']')`,
        })
        .where(eq(clients.id, client.id));

      // Deactivate linked client portal users
      try {
        await db
          .update(users)
          .set({
            status: "inactive",
            updatedAt: now,
          })
          .where(and(eq(users.clientId, client.id), eq(users.isDeleted, false)));
      } catch (userErr) {
        console.warn(`[deactivateExpiredContracts] User deactivation note for client ${client.id}:`, userErr);
      }

      // Cancel future scheduled jobs (preserve completed / delivered / collected!)
      try {
        await db
          .update(collectionJobs)
          .set({
            status: "missed",
            missedReason: "other",
            notes: `[Auto-Cancelled: Contract expired on ${client.contractEndDate}]`,
            updatedAt: now,
          })
          .where(
            and(
              eq(collectionJobs.clientId, client.id),
              eq(collectionJobs.isDeleted, false),
              eq(collectionJobs.status, "scheduled")
            )
          );
      } catch (jobErr) {
        console.warn(`[deactivateExpiredContracts] Job cancellation note for client ${client.id}:`, jobErr);
      }
    }

    try {
      revalidatePath("/clients");
      revalidatePath("/operations/schedule");
      revalidatePath("/operations/routes");
      revalidatePath("/routes");
      revalidatePath("/");
    } catch {
      // In background context outside request lifecycle, revalidatePath is safe to ignore
    }

    return {
      deactivatedCount: deactivatedClientIds.length,
      deactivatedClientIds,
      processedAt: now.toISOString(),
    };
  } catch (error) {
    console.error("[deactivateExpiredContractsService Error]:", error);
    return {
      deactivatedCount: 0,
      deactivatedClientIds: [],
      processedAt: now.toISOString(),
    };
  }
}

/**
 * Global background watcher: runs automatic expiration checks periodically in the
 * server process, ensuring reliable handling even if no user is logged in.
 */
const WATCHER_KEY = Symbol.for("rafiki.contract.expiration.watcher");
const globalScope = globalThis as unknown as { [WATCHER_KEY]?: boolean };

if (typeof setInterval !== "undefined" && !globalScope[WATCHER_KEY]) {
  globalScope[WATCHER_KEY] = true;

  // Run on startup
  setTimeout(() => {
    deactivateExpiredContractsService().catch((e) =>
      console.warn("[Initial contract expiration check note]:", e)
    );
  }, 3000);

  // Run every 1 hour (3600000ms)
  setInterval(() => {
    deactivateExpiredContractsService().catch((e) =>
      console.warn("[Periodic contract expiration check note]:", e)
    );
  }, 1000 * 60 * 60);
}
