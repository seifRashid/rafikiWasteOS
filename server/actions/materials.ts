"use server";

import { z } from "zod";
import { db } from "@/server/db";
import { wasteMaterials } from "@/server/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";

function safeRevalidatePath(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // In standalone scripts/tests outside Next.js request context, revalidatePath is a no-op
  }
}

const CreateMaterialSchema = z.object({
  code: z
    .string()
    .min(2, "Material code is required (e.g. PET-CLR)")
    .max(32, "Code must be 32 characters or less")
    .transform((val) => val.trim().toUpperCase()),
  name: z
    .string()
    .min(2, "Material name is required")
    .max(128, "Name must be 128 characters or less")
    .transform((val) => val.trim()),
  category: z
    .string()
    .min(2, "Category is required")
    .max(64, "Category must be 64 characters or less")
    .transform((val) => val.trim()),
  benchmarkPrice: z.coerce.number().positive("Benchmark scrap price must be a positive number"),
  baleDensity: z
    .string()
    .min(2, "Bale density benchmark is required")
    .max(128, "Bale density must be 128 characters or less")
    .transform((val) => val.trim()),
  acceptable: z
    .string()
    .min(2, "Acceptable specifications are required")
    .transform((val) => val.trim()),
  rejects: z
    .string()
    .min(2, "Rejection criteria are required")
    .transform((val) => val.trim()),
  isVerified: z.boolean().default(true),
});

const UpdateMaterialSchema = z.object({
  id: z.string().uuid("Invalid material ID"),
  code: z
    .string()
    .min(2, "Material code is required")
    .max(32, "Code must be 32 characters or less")
    .transform((val) => val.trim().toUpperCase()),
  name: z
    .string()
    .min(2, "Material name is required")
    .max(128, "Name must be 128 characters or less")
    .transform((val) => val.trim()),
  category: z
    .string()
    .min(2, "Category is required")
    .max(64, "Category must be 64 characters or less")
    .transform((val) => val.trim()),
  benchmarkPrice: z.coerce.number().positive("Benchmark scrap price must be a positive number"),
  baleDensity: z
    .string()
    .min(2, "Bale density benchmark is required")
    .max(128, "Bale density must be 128 characters or less")
    .transform((val) => val.trim()),
  acceptable: z
    .string()
    .min(2, "Acceptable specifications are required")
    .transform((val) => val.trim()),
  rejects: z
    .string()
    .min(2, "Rejection criteria are required")
    .transform((val) => val.trim()),
  isVerified: z.boolean().default(true),
});

export async function createMaterialAction(rawInput: unknown) {
  try {
    const parsed = CreateMaterialSchema.safeParse(rawInput);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
      return { success: false, error: errorMsg || "Validation failed" };
    }

    const data = parsed.data;

    // Check if material code already exists
    const [existing] = await db
      .select({ id: wasteMaterials.id })
      .from(wasteMaterials)
      .where(and(eq(wasteMaterials.code, data.code), eq(wasteMaterials.isDeleted, false)));

    if (existing) {
      return {
        success: false,
        error: `A material with code "${data.code}" already exists.`,
      };
    }

    const [created] = await db
      .insert(wasteMaterials)
      .values({
        code: data.code,
        name: data.name,
        category: data.category,
        benchmarkPrice: data.benchmarkPrice.toFixed(2),
        baleDensity: data.baleDensity,
        acceptable: data.acceptable,
        rejects: data.rejects,
        isVerified: data.isVerified,
      })
      .returning();

    safeRevalidatePath("/waste/materials");
    safeRevalidatePath("/waste");
    safeRevalidatePath("/inventory");

    return { success: true, data: created };
  } catch (error) {
    console.error("[ACTION_ERROR: createMaterialAction]", error);
    return {
      success: false,
      error: "An unexpected error occurred while saving the material.",
    };
  }
}

export async function updateMaterialAction(rawInput: unknown) {
  try {
    const parsed = UpdateMaterialSchema.safeParse(rawInput);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
      return { success: false, error: errorMsg || "Validation failed" };
    }

    const { id, ...data } = parsed.data;

    // Check if another material with the same code exists
    const [codeConflict] = await db
      .select({ id: wasteMaterials.id })
      .from(wasteMaterials)
      .where(
        and(
          eq(wasteMaterials.code, data.code),
          ne(wasteMaterials.id, id),
          eq(wasteMaterials.isDeleted, false)
        )
      );

    if (codeConflict) {
      return {
        success: false,
        error: `Another material with code "${data.code}" already exists.`,
      };
    }

    const [updated] = await db
      .update(wasteMaterials)
      .set({
        code: data.code,
        name: data.name,
        category: data.category,
        benchmarkPrice: data.benchmarkPrice.toFixed(2),
        baleDensity: data.baleDensity,
        acceptable: data.acceptable,
        rejects: data.rejects,
        isVerified: data.isVerified,
        updatedAt: new Date(),
      })
      .where(eq(wasteMaterials.id, id))
      .returning();

    if (!updated) {
      return { success: false, error: "Material record not found." };
    }

    safeRevalidatePath("/waste/materials");
    safeRevalidatePath("/waste");
    safeRevalidatePath("/inventory");

    return { success: true, data: updated };
  } catch (error) {
    console.error("[ACTION_ERROR: updateMaterialAction]", error);
    return {
      success: false,
      error: "An unexpected error occurred while updating the material.",
    };
  }
}
