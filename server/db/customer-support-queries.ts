import { db } from "./index";
import { customerRequests, customerComplaints, clients } from "./schema";
import { eq, and, desc } from "drizzle-orm";

export interface ClientRequestItem {
  id: string;
  ticketNumber: string;
  type: string;
  subject: string;
  details: string;
  priority: string;
  status: string;
  preferredDate: string | null;
  adminNotes: string | null;
  createdAt: Date;
}

export interface ClientComplaintItem {
  id: string;
  ticketNumber: string;
  category: string;
  subject: string;
  description: string;
  priority: string;
  status: string;
  assignedTo: string | null;
  resolutionNotes: string | null;
  createdAt: Date;
}

export interface AdminRequestItem extends ClientRequestItem {
  clientName: string;
  clientAccountNumber: string;
}

export interface AdminComplaintItem extends ClientComplaintItem {
  clientName: string;
  clientAccountNumber: string;
}

/**
 * Data Isolation: Query strictly filtered by authenticated client ID.
 */
export async function getClientCustomerRequests(clientId: string): Promise<ClientRequestItem[]> {
  try {
    const records = await db
      .select({
        id: customerRequests.id,
        ticketNumber: customerRequests.ticketNumber,
        type: customerRequests.type,
        subject: customerRequests.subject,
        details: customerRequests.details,
        priority: customerRequests.priority,
        status: customerRequests.status,
        preferredDate: customerRequests.preferredDate,
        adminNotes: customerRequests.adminNotes,
        createdAt: customerRequests.createdAt,
      })
      .from(customerRequests)
      .where(and(eq(customerRequests.clientId, clientId), eq(customerRequests.isDeleted, false)))
      .orderBy(desc(customerRequests.createdAt));

    return records;
  } catch (error) {
    console.error("[getClientCustomerRequests Error]:", error);
    return [];
  }
}

/**
 * Data Isolation: Query strictly filtered by authenticated client ID.
 */
export async function getClientCustomerComplaints(clientId: string): Promise<ClientComplaintItem[]> {
  try {
    const records = await db
      .select({
        id: customerComplaints.id,
        ticketNumber: customerComplaints.ticketNumber,
        category: customerComplaints.category,
        subject: customerComplaints.subject,
        description: customerComplaints.description,
        priority: customerComplaints.priority,
        status: customerComplaints.status,
        assignedTo: customerComplaints.assignedTo,
        resolutionNotes: customerComplaints.resolutionNotes,
        createdAt: customerComplaints.createdAt,
      })
      .from(customerComplaints)
      .where(and(eq(customerComplaints.clientId, clientId), eq(customerComplaints.isDeleted, false)))
      .orderBy(desc(customerComplaints.createdAt));

    return records;
  } catch (error) {
    console.error("[getClientCustomerComplaints Error]:", error);
    return [];
  }
}

/**
 * Admin query: Fetch all customer service requests across all clients.
 */
export async function getAllCustomerRequestsAdmin(): Promise<AdminRequestItem[]> {
  try {
    const records = await db
      .select({
        id: customerRequests.id,
        ticketNumber: customerRequests.ticketNumber,
        type: customerRequests.type,
        subject: customerRequests.subject,
        details: customerRequests.details,
        priority: customerRequests.priority,
        status: customerRequests.status,
        preferredDate: customerRequests.preferredDate,
        adminNotes: customerRequests.adminNotes,
        createdAt: customerRequests.createdAt,
        clientName: clients.name,
        clientAccountNumber: clients.accountNumber,
      })
      .from(customerRequests)
      .innerJoin(clients, eq(customerRequests.clientId, clients.id))
      .where(eq(customerRequests.isDeleted, false))
      .orderBy(desc(customerRequests.createdAt));

    return records;
  } catch (error) {
    console.error("[getAllCustomerRequestsAdmin Error]:", error);
    return [];
  }
}

/**
 * Admin query: Fetch all customer complaints across all clients.
 */
export async function getAllCustomerComplaintsAdmin(): Promise<AdminComplaintItem[]> {
  try {
    const records = await db
      .select({
        id: customerComplaints.id,
        ticketNumber: customerComplaints.ticketNumber,
        category: customerComplaints.category,
        subject: customerComplaints.subject,
        description: customerComplaints.description,
        priority: customerComplaints.priority,
        status: customerComplaints.status,
        assignedTo: customerComplaints.assignedTo,
        resolutionNotes: customerComplaints.resolutionNotes,
        createdAt: customerComplaints.createdAt,
        clientName: clients.name,
        clientAccountNumber: clients.accountNumber,
      })
      .from(customerComplaints)
      .innerJoin(clients, eq(customerComplaints.clientId, clients.id))
      .where(eq(customerComplaints.isDeleted, false))
      .orderBy(desc(customerComplaints.createdAt));

    return records;
  } catch (error) {
    console.error("[getAllCustomerComplaintsAdmin Error]:", error);
    return [];
  }
}
