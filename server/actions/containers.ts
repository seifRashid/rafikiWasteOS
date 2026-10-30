"use server";

import { z } from "zod";
import { db } from "@/server/db";
import { containerTypes, assets } from "@/server/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";

function safeRevalidatePath(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // No-op outside Next.js request context
  }
}

const CreateContainerTypeSchema = z.object({
  code: z
    .string()
    .min(2, "Container code is required (e.g. BIN-240L)")
    .max(32, "Code must be 32 characters or less")
    .transform((val) => val.trim().toUpperCase()),
  name: z
    .string()
    .min(2, "Container name is required")
    .max(128, "Name must be 128 characters or less")
    .transform((val) => val.trim()),
  category: z
    .string()
    .min(2, "Category is required")
    .max(64, "Category must be 64 characters or less")
    .transform((val) => val.trim()),
  capacityLitres: z.coerce.number().int().positive("Capacity must be a positive integer in litres"),
  compatibleStream: z
    .string()
    .min(2, "Compatible stream is required")
    .max(64)
    .default("All Streams"),
  totalStock: z.coerce.number().int().nonnegative("Total stock must be non-negative").default(0),
  colorCode: z.string().default("#00993F"),
  rfidTracked: z.boolean().default(true),
  description: z.string().optional().nullable(),
});

const UpdateContainerTypeSchema = z.object({
  id: z.string().uuid("Invalid container type ID"),
  code: z
    .string()
    .min(2, "Container code is required")
    .max(32, "Code must be 32 characters or less")
    .transform((val) => val.trim().toUpperCase()),
  name: z
    .string()
    .min(2, "Container name is required")
    .max(128, "Name must be 128 characters or less")
    .transform((val) => val.trim()),
  category: z
    .string()
    .min(2, "Category is required")
    .max(64, "Category must be 64 characters or less")
    .transform((val) => val.trim()),
  capacityLitres: z.coerce.number().int().positive("Capacity must be a positive integer in litres"),
  compatibleStream: z
    .string()
    .min(2, "Compatible stream is required")
    .max(64)
    .default("All Streams"),
  totalStock: z.coerce.number().int().nonnegative("Total stock must be non-negative"),
  colorCode: z.string().default("#00993F"),
  rfidTracked: z.boolean().default(true),
  description: z.string().optional().nullable(),
});

export async function createContainerTypeAction(rawInput: unknown) {
  try {
    const parsed = CreateContainerTypeSchema.safeParse(rawInput);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
      return { success: false, error: errorMsg || "Validation failed" };
    }

    const data = parsed.data;

    // Check code collision
    const [existing] = await db
      .select({ id: containerTypes.id })
      .from(containerTypes)
      .where(and(eq(containerTypes.code, data.code), eq(containerTypes.isDeleted, false)));

    if (existing) {
      return {
        success: false,
        error: `A container type with code "${data.code}" already exists.`,
      };
    }

    const [created] = await db
      .insert(containerTypes)
      .values({
        code: data.code,
        name: data.name,
        category: data.category,
        capacityLitres: data.capacityLitres,
        compatibleStream: data.compatibleStream,
        totalStock: data.totalStock,
        colorCode: data.colorCode,
        rfidTracked: data.rfidTracked,
        description: data.description || null,
      })
      .returning();

    safeRevalidatePath("/fleet/assets");
    safeRevalidatePath("/fleet");
    safeRevalidatePath("/customers/clients");

    return { success: true, data: created };
  } catch (error) {
    console.error("[ACTION_ERROR: createContainerTypeAction]", error);
    return {
      success: false,
      error: "An unexpected error occurred while saving the container type.",
    };
  }
}

export async function updateContainerTypeAction(rawInput: unknown) {
  try {
    const parsed = UpdateContainerTypeSchema.safeParse(rawInput);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
      return { success: false, error: errorMsg || "Validation failed" };
    }

    const { id, ...data } = parsed.data;

    // Check code collision
    const [codeConflict] = await db
      .select({ id: containerTypes.id })
      .from(containerTypes)
      .where(
        and(
          eq(containerTypes.code, data.code),
          ne(containerTypes.id, id),
          eq(containerTypes.isDeleted, false)
        )
      );

    if (codeConflict) {
      return {
        success: false,
        error: `Another container type with code "${data.code}" already exists.`,
      };
    }

    const [updated] = await db
      .update(containerTypes)
      .set({
        code: data.code,
        name: data.name,
        category: data.category,
        capacityLitres: data.capacityLitres,
        compatibleStream: data.compatibleStream,
        totalStock: data.totalStock,
        colorCode: data.colorCode,
        rfidTracked: data.rfidTracked,
        description: data.description || null,
        updatedAt: new Date(),
      })
      .where(eq(containerTypes.id, id))
      .returning();

    if (!updated) {
      return { success: false, error: "Container type record not found." };
    }

    safeRevalidatePath("/fleet/assets");
    safeRevalidatePath("/fleet");
    safeRevalidatePath("/customers/clients");

    return { success: true, data: updated };
  } catch (error) {
    console.error("[ACTION_ERROR: updateContainerTypeAction]", error);
    return {
      success: false,
      error: "An unexpected error occurred while updating the container type.",
    };
  }
}

const CreateAssetSchema = z.object({
  assetTag: z
    .string()
    .min(2, "Asset tag is required")
    .max(32)
    .transform((v) => v.trim().toUpperCase()),
  name: z.string().min(2, "Asset name is required").max(128).transform((v) => v.trim()),
  category: z.enum([
    "wheeled_bin_240l",
    "wheeled_bin_1100l",
    "static_compactor",
    "weighbridge_scale",
    "baling_press",
    "shredder",
  ]),
  location: z.string().min(2, "Location is required").transform((v) => v.trim()),
  condition: z.enum(["Excellent", "Good", "Fair", "Damaged"]).default("Good"),
  purchaseCost: z.coerce.number().optional().nullable(),
});

const UpdateAssetSchema = z.object({
  id: z.string().uuid("Invalid asset ID"),
  assetTag: z
    .string()
    .min(2, "Asset tag is required")
    .max(32)
    .transform((v) => v.trim().toUpperCase()),
  name: z.string().min(2, "Asset name is required").max(128).transform((v) => v.trim()),
  category: z.enum([
    "wheeled_bin_240l",
    "wheeled_bin_1100l",
    "static_compactor",
    "weighbridge_scale",
    "baling_press",
    "shredder",
  ]),
  location: z.string().min(2, "Location is required").transform((v) => v.trim()),
  condition: z.enum(["Excellent", "Good", "Fair", "Damaged"]).default("Good"),
  purchaseCost: z.coerce.number().optional().nullable(),
});

export async function createAssetAction(rawInput: unknown) {
  try {
    const parsed = CreateAssetSchema.safeParse(rawInput);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
      return { success: false, error: errorMsg || "Validation failed" };
    }

    const data = parsed.data;

    const [existing] = await db
      .select({ id: assets.id })
      .from(assets)
      .where(and(eq(assets.assetTag, data.assetTag), eq(assets.isDeleted, false)));

    if (existing) {
      return {
        success: false,
        error: `An asset with tag "${data.assetTag}" already exists.`,
      };
    }

    const [created] = await db
      .insert(assets)
      .values({
        assetTag: data.assetTag,
        name: data.name,
        category: data.category,
        location: data.location,
        condition: data.condition,
        purchaseCost: data.purchaseCost ? data.purchaseCost.toFixed(2) : null,
      })
      .returning();

    safeRevalidatePath("/fleet/assets");
    safeRevalidatePath("/fleet");

    return { success: true, data: created };
  } catch (error) {
    console.error("[ACTION_ERROR: createAssetAction]", error);
    return { success: false, error: "An unexpected error occurred while saving the asset." };
  }
}

export async function updateAssetAction(rawInput: unknown) {
  try {
    const parsed = UpdateAssetSchema.safeParse(rawInput);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
      return { success: false, error: errorMsg || "Validation failed" };
    }

    const { id, ...data } = parsed.data;

    const [updated] = await db
      .update(assets)
      .set({
        assetTag: data.assetTag,
        name: data.name,
        category: data.category,
        location: data.location,
        condition: data.condition,
        purchaseCost: data.purchaseCost ? data.purchaseCost.toFixed(2) : null,
        updatedAt: new Date(),
      })
      .where(eq(assets.id, id))
      .returning();

    safeRevalidatePath("/fleet/assets");
    safeRevalidatePath("/fleet");

    return { success: true, data: updated };
  } catch (error) {
    console.error("[ACTION_ERROR: updateAssetAction]", error);
    return { success: false, error: "An unexpected error occurred while updating the asset." };
  }
}
