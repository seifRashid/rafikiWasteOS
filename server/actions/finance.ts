"use server";

import { z } from "zod";
import { db } from "@/server/db";
import { invoices, expenses, invoiceStatusEnum, expenseCategoryEnum } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const CreateInvoiceSchema = z.object({
  clientId: z.string().uuid(),
  amount: z.number().positive("Invoice amount must be positive"),
  billingPeriod: z.string().min(2, "Billing period is required"),
  dueDate: z.string(),
  notes: z.string().optional(),
});

const RecordPaymentSchema = z.object({
  invoiceId: z.string().uuid(),
  paymentMethod: z.string().min(2, "Payment method is required"),
  paymentReference: z.string().min(2, "Payment reference is required"),
});

const CreateExpenseSchema = z.object({
  category: z.enum([
    "fuel",
    "salaries_wages",
    "vehicle_maintenance",
    "ppe_safety",
    "depot_rent_utilities",
    "licences_compliance",
    "spare_parts",
    "other_operational",
  ]),
  amount: z.number().positive("Expense amount must be positive"),
  description: z.string().min(3, "Description is required"),
  paidTo: z.string().optional(),
  vehicleId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  expenseDate: z.string(),
});

export async function createInvoiceAction(rawInput: unknown) {
  try {
    const parsed = CreateInvoiceSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { success: false, error: "Validation failed" };
    }

    const { clientId, amount, billingPeriod, dueDate, notes } = parsed.data;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const today = new Date().toISOString().split("T")[0];

    const [newInvoice] = await db
      .insert(invoices)
      .values({
        invoiceNumber,
        clientId,
        amount: amount.toFixed(2),
        currency: "KES",
        status: "pending",
        billingPeriod,
        issueDate: today,
        dueDate,
        notes: notes || null,
      })
      .returning();

    revalidatePath("/finance");
    revalidatePath(`/clients/${clientId}`);
    revalidatePath("/");

    return { success: true, data: newInvoice };
  } catch (error) {
    console.error("[ACTION_ERROR: createInvoiceAction]", error);
    return { success: false, error: "Failed to generate invoice." };
  }
}

export async function markInvoicePaidAction(rawInput: unknown) {
  try {
    const parsed = RecordPaymentSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { success: false, error: "Invalid payment payload" };
    }

    const { invoiceId, paymentMethod, paymentReference } = parsed.data;
    const today = new Date().toISOString().split("T")[0];

    await db
      .update(invoices)
      .set({
        status: "paid",
        paidDate: today,
        paymentMethod,
        paymentReference,
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, invoiceId));

    revalidatePath("/finance");
    revalidatePath("/clients");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("[ACTION_ERROR: markInvoicePaidAction]", error);
    return { success: false, error: "Failed to record payment." };
  }
}

export async function createExpenseAction(rawInput: unknown) {
  try {
    const parsed = CreateExpenseSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { success: false, error: "Validation failed for expense entry" };
    }

    const { category, amount, description, paidTo, vehicleId, projectId, expenseDate } =
      parsed.data;
    const expenseCode = `EXP-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

    const [newExpense] = await db
      .insert(expenses)
      .values({
        expenseCode,
        category,
        amount: amount.toFixed(2),
        currency: "KES",
        description,
        paidTo: paidTo || null,
        vehicleId: vehicleId || null,
        projectId: projectId || null,
        expenseDate,
      })
      .returning();

    revalidatePath("/finance");
    revalidatePath("/");

    return { success: true, data: newExpense };
  } catch (error) {
    console.error("[ACTION_ERROR: createExpenseAction]", error);
    return { success: false, error: "Failed to log operational expense." };
  }
}
