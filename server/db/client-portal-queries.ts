import { db } from "./index";
import {
  clients,
  collectionJobs,
  invoices,
  type Client,
  type CollectionJob,
  type Invoice,
} from "./schema";
import { eq, and, desc, gte, lte, ilike, or } from "drizzle-orm";

export interface ClientDashboardData {
  client: Client;
  metrics: {
    totalCollections: number;
    completedCollections: number;
    upcomingCollections: number;
    missedCollections: number;
    totalWeightKg: number;
    organicWeightKg: number;
    recyclableWeightKg: number;
    residualWeightKg: number;
    diversionRate: number;
    collectionFrequency: string;
    pendingInvoicesCount: number;
    pendingInvoicesTotal: number;
  };
  nextPickup: CollectionJob | null;
  recentCollections: CollectionJob[];
  recentInvoices: Invoice[];
}

/**
 * Data Isolation: Query strictly restricted to the client's verified organization ID.
 */
export async function getClientPortalDashboard(clientId: string): Promise<ClientDashboardData | null> {
  try {
    const [client] = await db
      .select()
      .from(clients)
      .where(and(eq(clients.id, clientId), eq(clients.isDeleted, false)))
      .limit(1);

    if (!client) {
      return null;
    }

    // Fetch only this client's jobs
    const jobs = await db
      .select()
      .from(collectionJobs)
      .where(and(eq(collectionJobs.clientId, clientId), eq(collectionJobs.isDeleted, false)))
      .orderBy(desc(collectionJobs.scheduledAt));

    // Fetch only this client's invoices
    const clientInvoices = await db
      .select()
      .from(invoices)
      .where(and(eq(invoices.clientId, clientId), eq(invoices.isDeleted, false)))
      .orderBy(desc(invoices.issueDate));

    let completedCollections = 0;
    let upcomingCollections = 0;
    let missedCollections = 0;
    let totalWeightKg = 0;
    let organicWeightKg = 0;
    let recyclableWeightKg = 0;
    let residualWeightKg = 0;

    const now = new Date();
    let nextPickup: CollectionJob | null = null;

    jobs.forEach((j) => {
      if (j.status === "completed" || j.status === "delivered") {
        completedCollections++;
        const weight = parseFloat(j.actualWeightKg || j.expectedQuantityKg || "0");
        totalWeightKg += weight;
        if (j.wasteStream === "organic") organicWeightKg += weight;
        else if (j.wasteStream === "recyclable") recyclableWeightKg += weight;
        else if (j.wasteStream === "residual") residualWeightKg += weight;
      } else if (j.status === "scheduled" || j.status === "assigned" || j.status === "in_progress") {
        upcomingCollections++;
        if (new Date(j.scheduledAt) >= now) {
          if (!nextPickup || new Date(j.scheduledAt) < new Date(nextPickup.scheduledAt)) {
            nextPickup = j;
          }
        }
      } else if (j.status === "missed") {
        missedCollections++;
      }
    });

    const totalDiverted = organicWeightKg + recyclableWeightKg;
    const diversionRate =
      totalWeightKg > 0 ? Math.min(100, Math.round((totalDiverted / totalWeightKg) * 1000) / 10) : 0;

    let pendingInvoicesCount = 0;
    let pendingInvoicesTotal = 0;
    clientInvoices.forEach((inv) => {
      if (inv.status === "pending" || inv.status === "overdue") {
        pendingInvoicesCount++;
        pendingInvoicesTotal += parseFloat(inv.amount);
      }
    });

    return {
      client,
      metrics: {
        totalCollections: jobs.length,
        completedCollections,
        upcomingCollections,
        missedCollections,
        totalWeightKg,
        organicWeightKg,
        recyclableWeightKg,
        residualWeightKg,
        diversionRate,
        collectionFrequency: client.collectionFrequency.replace("_", " "),
        pendingInvoicesCount,
        pendingInvoicesTotal,
      },
      nextPickup,
      recentCollections: jobs.slice(0, 5),
      recentInvoices: clientInvoices.slice(0, 3),
    };
  } catch (error) {
    console.error("[getClientPortalDashboard Error]:", error);
    return null;
  }
}

export interface CollectionFilterParams {
  search?: string;
  status?: string;
  wasteStream?: string;
  fromDate?: string;
  toDate?: string;
}

/**
 * Data Isolation: Query strictly filtered by client's verified organization ID.
 */
export async function getClientCollectionHistory(
  clientId: string,
  params?: CollectionFilterParams
): Promise<CollectionJob[]> {
  try {
    const conditions = [
      eq(collectionJobs.clientId, clientId),
      eq(collectionJobs.isDeleted, false),
    ];

    if (params?.status && params.status !== "all") {
      conditions.push(eq(collectionJobs.status, params.status as any));
    }

    if (params?.wasteStream && params.wasteStream !== "all") {
      conditions.push(eq(collectionJobs.wasteStream, params.wasteStream as any));
    }

    if (params?.fromDate) {
      conditions.push(gte(collectionJobs.scheduledAt, new Date(params.fromDate)));
    }

    if (params?.toDate) {
      const end = new Date(params.toDate);
      end.setHours(23, 59, 59, 999);
      conditions.push(lte(collectionJobs.scheduledAt, end));
    }

    if (params?.search && params.search.trim()) {
      const term = `%${params.search.trim()}%`;
      conditions.push(
        or(
          ilike(collectionJobs.jobNumber, term),
          ilike(collectionJobs.notes, term),
          ilike(collectionJobs.driverName, term)
        )!
      );
    }

    const records = await db
      .select()
      .from(collectionJobs)
      .where(and(...conditions))
      .orderBy(desc(collectionJobs.scheduledAt));

    return records;
  } catch (error) {
    console.error("[getClientCollectionHistory Error]:", error);
    return [];
  }
}

/**
 * Data Isolation: Invoices restricted to clientId
 */
export async function getClientInvoices(clientId: string): Promise<Invoice[]> {
  try {
    return await db
      .select()
      .from(invoices)
      .where(and(eq(invoices.clientId, clientId), eq(invoices.isDeleted, false)))
      .orderBy(desc(invoices.issueDate));
  } catch (error) {
    console.error("[getClientInvoices Error]:", error);
    return [];
  }
}

/**
 * Data Isolation: Organization profile for clientId
 */
export async function getClientOrganization(clientId: string): Promise<Client | null> {
  try {
    const [client] = await db
      .select()
      .from(clients)
      .where(and(eq(clients.id, clientId), eq(clients.isDeleted, false)))
      .limit(1);
    return client || null;
  } catch (error) {
    console.error("[getClientOrganization Error]:", error);
    return null;
  }
}
