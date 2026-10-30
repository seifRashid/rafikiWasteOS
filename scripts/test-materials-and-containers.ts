import { db } from "../server/db";
import { wasteMaterials, containerTypes, assets, clients } from "../server/db/schema";
import { eq } from "drizzle-orm";
import {
  createMaterialAction,
  updateMaterialAction,
} from "../server/actions/materials";
import {
  createContainerTypeAction,
  updateContainerTypeAction,
  createAssetAction,
  updateAssetAction,
} from "../server/actions/containers";
import {
  getWasteMaterials,
  getContainerTypes,
  getContainerAllocations,
  getAssets,
} from "../server/db/queries";

async function runVerification() {
  console.log("==================================================");
  console.log("Rafiki WasteOS: Materials & Containers E2E Test");
  console.log("==================================================");

  // 1. Materials: Fetch
  console.log("\n[1] Verifying Materials Database Queries...");
  const materials = await getWasteMaterials();
  console.log(`Retrieved ${materials.length} materials from database.`);
  materials.forEach((m) => {
    console.log(` - [${m.code}] ${m.name} | Stream: ${m.wasteStream} | KES ${m.benchmarkPrice}/kg`);
  });

  // 2. Materials: Create custom material
  console.log("\n[2] Testing createMaterialAction...");
  const testMatCode = "TEST-WVN-" + Date.now().toString().slice(-4);
  const createMatRes = await createMaterialAction({
    code: testMatCode,
    name: "Woven PP Bulk Sacks (Grade A)",
    category: "Rigid Plastics",
    wasteStream: "recyclable",
    benchmarkPrice: 32.5,
    baleDensity: "180 - 220 kg/bale",
    acceptable: "Clean white poly sacks, unprinted or single-color logo",
    rejects: "Cement dust, grease, multi-layer laminates",
    isVerified: true,
  });

  if (!createMatRes.success || !createMatRes.data) {
    throw new Error("Failed to create material: " + createMatRes.error);
  }
  console.log("✅ Created material:", createMatRes.data.code, createMatRes.data.name);

  // 3. Materials: Update material
  console.log("\n[3] Testing updateMaterialAction...");
  const updateMatRes = await updateMaterialAction({
    id: createMatRes.data.id,
    code: testMatCode,
    name: "Woven PP Bulk Sacks (Sorted & Washed)",
    category: "Plastics",
    wasteStream: "recyclable",
    benchmarkPrice: 36.0,
    baleDensity: "200 - 240 kg/bale",
    acceptable: "Clean white poly sacks",
    rejects: "Heavy contamination",
    isVerified: true,
  });

  if (!updateMatRes.success || !updateMatRes.data) {
    throw new Error("Failed to update material: " + updateMatRes.error);
  }
  console.log("✅ Updated material benchmark price to KES", updateMatRes.data.benchmarkPrice);

  // 4. Containers: Fetch & Allocations
  console.log("\n[4] Verifying Containers & Client Allocation Math...");
  const allocations = await getContainerAllocations();
  console.log(`Total Company Container Stock: ${allocations.totalFleetStock}`);
  console.log(`Total Client Deployed: ${allocations.totalAllocated}`);
  console.log(`Total in Depot: ${allocations.totalInDepot}`);
  allocations.containerTypes.forEach((c) => {
    console.log(
      ` - [${c.code}] ${c.name}: Total ${c.totalStock} | Allocated to Clients: ${c.allocatedCount} | In Depot: ${c.availableDepotStock}`
    );
  });

  // 5. Containers: Create Container Type
  console.log("\n[5] Testing createContainerTypeAction...");
  const testContainerCode = "TEST-DRM-" + Date.now().toString().slice(-4);
  const createContainerRes = await createContainerTypeAction({
    code: testContainerCode,
    name: "210L Steel Hazardous Waste Drum",
    category: "drum",
    capacityLitres: 210,
    compatibleStream: "Hazardous",
    totalStock: 30,
    colorCode: "#FECA36",
    rfidTracked: true,
    description: "UN-certified tight-head steel drum with tamper-evident seal",
  });

  if (!createContainerRes.success || !createContainerRes.data) {
    throw new Error("Failed to create container type: " + createContainerRes.error);
  }
  console.log("✅ Created container type:", createContainerRes.data.code, createContainerRes.data.name);

  // 6. Containers: Update Container Type
  console.log("\n[6] Testing updateContainerTypeAction...");
  const updateContainerRes = await updateContainerTypeAction({
    id: createContainerRes.data.id,
    code: testContainerCode,
    name: "210L Steel Hazardous Drum (Epoxy Lined)",
    category: "drum",
    capacityLitres: 210,
    compatibleStream: "Hazardous",
    totalStock: 45,
    colorCode: "#FECA36",
    rfidTracked: true,
    description: "UN-certified tight-head steel drum with internal epoxy phenolic lining",
  });

  if (!updateContainerRes.success || !updateContainerRes.data) {
    throw new Error("Failed to update container type: " + updateContainerRes.error);
  }
  console.log("✅ Updated container total stock to:", updateContainerRes.data.totalStock);

  // 7. Assets: Create & Update
  console.log("\n[7] Testing createAssetAction & updateAssetAction...");
  const testAssetTag = "TEST-SCL-" + Date.now().toString().slice(-4);
  const createAssetRes = await createAssetAction({
    assetTag: testAssetTag,
    name: "Mettler Toledo Platform Bench Scale 300kg",
    category: "weighbridge_scale",
    location: "Depot Intake Station 2",
    condition: "Excellent",
    purchaseCost: 95000,
  });

  if (!createAssetRes.success || !createAssetRes.data) {
    throw new Error("Failed to create asset: " + createAssetRes.error);
  }
  console.log("✅ Created asset:", createAssetRes.data.assetTag, createAssetRes.data.name);

  const updateAssetRes = await updateAssetAction({
    id: createAssetRes.data.id,
    assetTag: testAssetTag,
    name: "Mettler Toledo Platform Bench Scale 300kg (IP68)",
    category: "weighbridge_scale",
    location: "Depot Sorting Bay B",
    condition: "Excellent",
    purchaseCost: 110000,
  });

  if (!updateAssetRes.success || !updateAssetRes.data) {
    throw new Error("Failed to update asset: " + updateAssetRes.error);
  }
  console.log("✅ Updated asset location to:", updateAssetRes.data.location);

  // 8. Clean up test records
  console.log("\n[8] Cleaning up ephemeral test records...");
  await db.delete(wasteMaterials).where(eq(wasteMaterials.id, createMatRes.data.id));
  await db.delete(containerTypes).where(eq(containerTypes.id, createContainerRes.data.id));
  await db.delete(assets).where(eq(assets.id, createAssetRes.data.id));
  console.log("✅ Ephemeral test records safely purged.");

  console.log("\n==================================================");
  console.log("🎉 ALL MATERIALS & CONTAINERS TESTS PASSED PERFECTLY!");
  console.log("==================================================");
}

runVerification()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Test failed:", err);
    process.exit(1);
  });
