import { db } from "@/server/db";
import {
  collectionJobs,
  recyclableInventory,
  wasteMaterials,
  clients,
} from "@/server/db/schema";
import { eq, and, inArray, isNotNull, or } from "drizzle-orm";

// 60-second in-memory throttle for full inventory sync on page reads
const INVENTORY_SYNC_TTL_MS = 60 * 1000;
let lastFullInventorySyncAt = 0;

/**
 * Automatically creates or updates an inventory batch in `recyclable_inventory`
 * when a collection job is weighed in, collected, delivered, or marked completed.
 * Idempotent: checks `intakeJobId` to avoid duplicate batches for the same job.
 */
export async function syncInventoryBatchFromJob(jobId: string) {
  try {
    // Invalidate full sync throttle so any subsequent full check is fresh
    lastFullInventorySyncAt = 0;

    const [jobRecord] = await db
      .select({
        job: collectionJobs,
        client: clients,
      })
      .from(collectionJobs)
      .leftJoin(clients, eq(collectionJobs.clientId, clients.id))
      .where(and(eq(collectionJobs.id, jobId), eq(collectionJobs.isDeleted, false)))
      .limit(1);

    if (!jobRecord || !jobRecord.job) return null;
    const { job, client } = jobRecord;

    // Only auto-intake jobs that have reached a completed/delivered/collected state or have certified weight
    const isEligibleStatus = ["collected", "delivered", "completed"].includes(job.status);
    if (!isEligibleStatus && !job.actualWeightKg) return null;

    const netWeight = parseFloat(job.actualWeightKg || job.expectedQuantityKg || "0");
    if (netWeight <= 0) return null;

    // Check if an inventory batch already exists for this job
    const [existingBatch] = await db
      .select()
      .from(recyclableInventory)
      .where(and(eq(recyclableInventory.intakeJobId, job.id), eq(recyclableInventory.isDeleted, false)))
      .limit(1);

    if (existingBatch) {
      // Update weight if the batch hasn't been sorted/sold yet and weight changed
      if (existingBatch.stage === "collected" && parseFloat(existingBatch.collectedWeightKg) !== netWeight) {
        const [updatedBatch] = await db
          .update(recyclableInventory)
          .set({
            collectedWeightKg: netWeight.toFixed(2),
            currentWeightKg: netWeight.toFixed(2),
            updatedAt: new Date(),
          })
          .where(eq(recyclableInventory.id, existingBatch.id))
          .returning();
        return updatedBatch;
      }
      return existingBatch;
    }

    // Match the best material specification from `waste_materials`
    const allMaterials = await db
      .select()
      .from(wasteMaterials)
      .where(eq(wasteMaterials.isDeleted, false));

    const combinedContext = `${job.notes || ""} ${client?.wasteStreams || ""} ${job.wasteStream}`.toLowerCase();

    let matchedMaterial = allMaterials.find((m) => {
      if (m.code === "TEST") return false;
      if (job.wasteStream === "organic" && m.wasteStream === "organic") return true;
      return false;
    });

    if (!matchedMaterial && job.wasteStream === "recyclable") {
      if (combinedContext.includes("cardboard") || combinedContext.includes("occ") || combinedContext.includes("paper")) {
        matchedMaterial = allMaterials.find((m) => m.code.startsWith("OCC"));
      } else if (combinedContext.includes("hdpe") || combinedContext.includes("drum") || combinedContext.includes("jug")) {
        matchedMaterial = allMaterials.find((m) => m.code.startsWith("HDP"));
      } else if (combinedContext.includes("alum") || combinedContext.includes("can")) {
        matchedMaterial = allMaterials.find((m) => m.code.startsWith("ALU"));
      } else {
        matchedMaterial =
          allMaterials.find((m) => m.code.startsWith("PET")) ||
          allMaterials.find((m) => m.wasteStream === "recyclable" && m.code !== "TEST");
      }
    }

    if (!matchedMaterial) {
      matchedMaterial = allMaterials.find((m) => m.wasteStream === job.wasteStream && m.code !== "TEST");
    }

    // Determine material code, grade, and storage bay
    let materialCode = matchedMaterial?.code || "PET-CLR";
    let gradeQuality = matchedMaterial?.baleDensity
      ? `Standard (${matchedMaterial.baleDensity})`
      : "Certified Intake";
    let storageBay = matchedMaterial
      ? `Bay 01 - ${matchedMaterial.name}`
      : "Bay 01 - MRF Intake Floor";

    if (job.wasteStream === "organic") {
      materialCode = matchedMaterial?.code || "ORG-CMP";
      gradeQuality = matchedMaterial?.baleDensity
        ? `Raw Biomass (${matchedMaterial.baleDensity})`
        : "Composting Feedstock";
      storageBay = "Windrow 01 - Organic Composting Yard";
    } else if (job.wasteStream === "residual") {
      materialCode = matchedMaterial?.code || "RES-GEN";
      gradeQuality = "General Residual Stream";
      storageBay = "Transfer Bay - Residual Dispatch";
    } else if (job.wasteStream === "hazardous") {
      materialCode = matchedMaterial?.code || "HAZ-WST";
      gradeQuality = "Contained Hazardous";
      storageBay = "Secure Hazmat Containment Bay";
    } else if (job.wasteStream === "electronic") {
      materialCode = matchedMaterial?.code || "EWST-REC";
      gradeQuality = "E-Waste Recovery";
      storageBay = "Bay 05 - E-Waste Dismantling";
    } else if (materialCode.startsWith("OCC")) {
      storageBay = "Bay 04 - Dry OCC Warehouse";
    } else if (materialCode.startsWith("HDP")) {
      storageBay = "Bay 02 - HDPE Blow Moulding";
    } else if (materialCode.startsWith("ALU")) {
      storageBay = "Vault 01 - Non-Ferrous Metals";
    } else if (materialCode.startsWith("PET")) {
      storageBay = "Bay 01 - Baled Clear PET";
    }

    const cleanPrefix = materialCode.includes("-")
      ? materialCode.split("-")[0].toUpperCase()
      : materialCode.replace(/[^A-Za-z0-9]/g, "").substring(0, 3).toUpperCase() || "MAT";

    // Build deterministic, unique batch number linked to job number
    const jobSuffix = job.jobNumber.replace(/[^0-9]/g, "").slice(-4) || Date.now().toString().slice(-4);
    let batchNumber = `BAT-${cleanPrefix}-${jobSuffix}`;

    const [conflict] = await db
      .select({ id: recyclableInventory.id })
      .from(recyclableInventory)
      .where(eq(recyclableInventory.batchNumber, batchNumber))
      .limit(1);

    if (conflict) {
      batchNumber = `BAT-${cleanPrefix}-${jobSuffix}-${Math.floor(10 + Math.random() * 89)}`;
    }

    const clientLabel = client?.name ? ` from ${client.name}` : "";
    const [createdBatch] = await db
      .insert(recyclableInventory)
      .values({
        batchNumber,
        materialType: materialCode,
        gradeQuality,
        collectedWeightKg: netWeight.toFixed(2),
        currentWeightKg: netWeight.toFixed(2),
        stage: "collected",
        storageBay,
        intakeJobId: job.id,
        notes: `[Auto-Intake: ${job.jobNumber}] Collected${clientLabel}. ${job.notes || ""}`.trim(),
      })
      .returning();

    return createdBatch;
  } catch (err) {
    console.error("[syncInventoryBatchFromJob Error]:", err);
    return null;
  }
}

/**
 * Ensures all collection jobs that have been weighed or marked as collected/delivered/completed
 * have a corresponding batch in `recyclable_inventory`.
 * Throttled to once per 60s on passive page reads unless invalidated by a job status update.
 */
export async function syncAllCompletedJobsToInventory(force = false) {
  const now = Date.now();
  if (!force && now - lastFullInventorySyncAt < INVENTORY_SYNC_TTL_MS) {
    return;
  }
  lastFullInventorySyncAt = now;

  try {
    const [eligibleJobs, existingBatches] = await Promise.all([
      db
        .select({ id: collectionJobs.id })
        .from(collectionJobs)
        .where(
          and(
            eq(collectionJobs.isDeleted, false),
            or(
              inArray(collectionJobs.status, ["collected", "delivered", "completed"]),
              isNotNull(collectionJobs.actualWeightKg)
            )
          )
        ),
      db
        .select({ intakeJobId: recyclableInventory.intakeJobId })
        .from(recyclableInventory)
        .where(eq(recyclableInventory.isDeleted, false)),
    ]);

    if (eligibleJobs.length === 0) return;

    const syncedJobIds = new Set(existingBatches.map((b) => b.intakeJobId).filter(Boolean));

    for (const job of eligibleJobs) {
      if (!syncedJobIds.has(job.id)) {
        await syncInventoryBatchFromJob(job.id);
      }
    }
    lastFullInventorySyncAt = Date.now();
  } catch (err) {
    console.warn("[syncAllCompletedJobsToInventory Notice]:", err);
  }
}
