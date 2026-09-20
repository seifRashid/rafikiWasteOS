"use server";

import { z } from "zod";
import { db } from "@/server/db";
import { recyclableInventory, materialStageEnum, materialTypeEnum } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const RecordIntakeSchema = z.object({
  materialType: z.enum([
    "pet_plastic",
    "hdpe_plastic",
    "ldpe_film",
    "pp_polypropylene",
    "cardboard_occ",
    "mixed_paper",
    "aluminium_cans",
    "steel_scrap",
    "glass_cullet",
    "organic_compost",
    "electronic_waste",
  ]),
  gradeQuality: z.string().default("Standard"),
  collectedWeightKg: z.number().positive("Collected weight must be positive"),
  storageBay: z.string().min(2, "Storage bay location is required"),
  notes: z.string().optional(),
});

const RecordSaleSchema = z.object({
  batchId: z.string().uuid(),
  buyerName: z.string().min(2, "Buyer company name is required"),
  unitSellingPrice: z.number().positive("Unit price per kg is required"),
  soldWeightKg: z.number().positive("Sold weight must be positive"),
  notes: z.string().optional(),
});

export async function recordMaterialIntakeAction(rawInput: unknown) {
  try {
    const parsed = RecordIntakeSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { success: false, error: "Validation failed" };
    }

    const { materialType, gradeQuality, collectedWeightKg, storageBay, notes } = parsed.data;

    const shortCode = materialType.substring(0, 3).toUpperCase();
    const batchNumber = `BAT-${shortCode}-${Date.now().toString().slice(-4)}`;

    const [batch] = await db
      .insert(recyclableInventory)
      .values({
        batchNumber,
        materialType,
        gradeQuality,
        collectedWeightKg: collectedWeightKg.toFixed(2),
        currentWeightKg: collectedWeightKg.toFixed(2),
        stage: "collected",
        storageBay,
        notes: notes || null,
      })
      .returning();

    revalidatePath("/inventory");
    revalidatePath("/impact");
    revalidatePath("/");

    return { success: true, data: batch };
  } catch (error) {
    console.error("[ACTION_ERROR: recordMaterialIntakeAction]", error);
    return { success: false, error: "Failed to record material intake." };
  }
}

export async function updateMaterialStageAction(
  batchId: string,
  stage: "collected" | "sorted" | "stored" | "processed" | "sold" | "transferred",
  sortedWeightKg?: number,
  rejectedWeightKg?: number
) {
  try {
    const updateData: Record<string, unknown> = {
      stage,
      updatedAt: new Date(),
    };

    if (sortedWeightKg !== undefined) {
      updateData.sortedWeightKg = sortedWeightKg.toFixed(2);
      updateData.currentWeightKg = sortedWeightKg.toFixed(2);
    }
    if (rejectedWeightKg !== undefined) {
      updateData.rejectedWeightKg = rejectedWeightKg.toFixed(2);
    }

    await db.update(recyclableInventory).set(updateData).where(eq(recyclableInventory.id, batchId));

    revalidatePath("/inventory");
    revalidatePath("/impact");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("[ACTION_ERROR: updateMaterialStageAction]", error);
    return { success: false, error: "Failed to update material stage." };
  }
}

export async function recordMaterialSaleAction(rawInput: unknown) {
  try {
    const parsed = RecordSaleSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { success: false, error: "Invalid sale parameters" };
    }

    const { batchId, buyerName, unitSellingPrice, soldWeightKg, notes } = parsed.data;
    const totalRevenue = unitSellingPrice * soldWeightKg;

    await db
      .update(recyclableInventory)
      .set({
        buyerName,
        unitSellingPrice: unitSellingPrice.toFixed(2),
        totalRevenue: totalRevenue.toFixed(2),
        currentWeightKg: (0).toFixed(2), // Consumed/sold
        stage: "sold",
        notes: notes ? notes : undefined,
        updatedAt: new Date(),
      })
      .where(eq(recyclableInventory.id, batchId));

    revalidatePath("/inventory");
    revalidatePath("/finance");
    revalidatePath("/impact");
    revalidatePath("/");

    return { success: true, totalRevenue };
  } catch (error) {
    console.error("[ACTION_ERROR: recordMaterialSaleAction]", error);
    return { success: false, error: "Failed to record material sale." };
  }
}
