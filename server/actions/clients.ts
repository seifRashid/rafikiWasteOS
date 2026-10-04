"use server";

import { z } from "zod";
import { db } from "@/server/db";
import { clients, customerTypeEnum, collectionFrequencyEnum } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const CreateClientSchema = z.object({
  name: z.string().min(2, "Client name is required"),
  customerType: z.enum([
    "household",
    "apartment",
    "hotel",
    "restaurant",
    "business",
    "school",
    "institution",
    "government",
  ]),
  contactPerson: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().min(6, "Valid phone number is required"),
  physicalAddress: z.string().min(3, "Physical address is required"),
  countyRegion: z.string().min(2, "County/Region is required"),
  collectionFrequency: z.enum([
    "daily",
    "twice_weekly",
    "weekly",
    "bi_weekly",
    "monthly",
    "on_demand",
  ]),
  wasteStreams: z.string().default("Organic, Recyclable"),
  binCount: z.string().default("2 x 240L Bins"),
  monthlyFee: z.number().nonnegative().default(0),
  currency: z.string().default("KES"),
  notes: z.string().optional(),
});

export type ActionResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createClientAction(rawInput: unknown): Promise<ActionResponse> {
  try {
    const parsed = CreateClientSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed. Please review the highlighted fields.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const {
      name,
      customerType,
      contactPerson,
      email,
      phone,
      physicalAddress,
      countyRegion,
      collectionFrequency,
      wasteStreams,
      binCount,
      monthlyFee,
      currency,
      notes,
    } = parsed.data;

    // Generate unique account number
    const prefix = customerType.substring(0, 3).toUpperCase();
    const randomSeq = Math.floor(100 + Math.random() * 900);
    const accountNumber = `CLT-${prefix}-${randomSeq}`;

    const [newClient] = await db
      .insert(clients)
      .values({
        accountNumber,
        name,
        customerType,
        contactPerson: contactPerson || null,
        email: email || null,
        phone,
        physicalAddress,
        countyRegion,
        collectionFrequency,
        wasteStreams,
        binCount,
        monthlyFee: monthlyFee.toFixed(2),
        currency,
        notes: notes || null,
        isActive: true,
      })
      .returning();

    revalidatePath("/clients");
    revalidatePath("/");

    return { success: true, data: newClient };
  } catch (error) {
    console.error("[ACTION_ERROR: createClientAction]", error);
    return { success: false, error: "Failed to create client profile. Please try again." };
  }
}

export async function toggleClientStatusAction(
  clientId: string,
  isActive: boolean
): Promise<ActionResponse> {
  try {
    await db
      .update(clients)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(clients.id, clientId));

    revalidatePath("/clients");
    revalidatePath(`/clients/${clientId}`);
    return { success: true };
  } catch (error) {
    console.error("[ACTION_ERROR: toggleClientStatusAction]", error);
    return { success: false, error: "Failed to update client status." };
  }
}
