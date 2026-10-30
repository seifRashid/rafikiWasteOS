import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL || "";
if (!connectionString) {
  console.error("DATABASE_URL is not defined in .env.local");
  process.exit(1);
}

const sql = neon(connectionString);

export const initialContainerTypes = [
  {
    code: "BIN-240L",
    name: "240L Heavy-Duty Wheeled Bin",
    category: "Wheeled Bin",
    capacityLitres: 240,
    compatibleStream: "Organic & Recyclable",
    totalStock: 182,
    colorCode: "#00993F",
    rfidTracked: true,
    description: "Standard 240L curbside bins deployed across hotels, apartments, and schools.",
  },
  {
    code: "BIN-1100L",
    name: "1100L Heavy Steel Eurobin",
    category: "Eurobin",
    capacityLitres: 1100,
    compatibleStream: "Recyclable (Cardboard & Paper)",
    totalStock: 24,
    colorCode: "#08A6BA",
    rfidTracked: true,
    description: "Large 4-wheeled eurobins for bulk commercial and institutional waste generators.",
  },
  {
    code: "SKP-10M3",
    name: "10m³ Industrial Roll-On Skip",
    category: "Industrial Skip",
    capacityLitres: 10000,
    compatibleStream: "Residual & Construction",
    totalStock: 12,
    colorCode: "#B45309",
    rfidTracked: true,
    description: "Heavy-gauge steel skips deployed for industrial manufacturing clients and municipal debris.",
  },
  {
    code: "CAG-BAL",
    name: "1.5m³ Steel Baling Wire Cage",
    category: "Storage Cage",
    capacityLitres: 1500,
    compatibleStream: "Recyclable (PET Bottles & OCC)",
    totalStock: 15,
    colorCode: "#3B82F6",
    rfidTracked: false,
    description: "Collapsible wire mesh cages for staging uncompressed PET bottles and cardboard.",
  },
];

export const initialPhysicalAssets = [
  {
    assetTag: "SCL-01-WB",
    name: "Avery Berkel 60t Digital Weighbridge Scale",
    category: "weighbridge_scale",
    location: "Central Transfer Station - Ingate / Outgate",
    condition: "Excellent",
    purchaseCost: "4500000.00",
  },
  {
    assetTag: "BAL-B20-04",
    name: "Bramidan B20 Vertical Baler Press",
    category: "baling_press",
    location: "MRF Shed Bay 01",
    condition: "Good",
    purchaseCost: "1850000.00",
  },
  {
    assetTag: "BIN-LOT-240",
    name: "182 x Heavy-Duty Wheeled Bins (240L)",
    category: "wheeled_bin_240l",
    location: "Deployed at Client Sites & Depot Storage",
    condition: "Good",
    purchaseCost: "1274000.00",
  },
  {
    assetTag: "SKP-1100-08",
    name: "12 x Heavy Steel Skip Bins (1100L)",
    category: "wheeled_bin_1100l",
    location: "Industrial Area & Brewery Lots",
    condition: "Fair",
    purchaseCost: "720000.00",
  },
];

export async function initContainersAndAssets() {
  console.log("🌱 1. Checking waste_materials waste_stream column...");
  await sql.query(`
    ALTER TABLE waste_materials 
    ADD COLUMN IF NOT EXISTS waste_stream varchar(32) DEFAULT 'recyclable' NOT NULL;
  `);

  await sql.query(`
    UPDATE waste_materials SET waste_stream = 'organic' WHERE code = 'ORG-CMP';
  `);

  console.log("🌱 2. Ensuring container_types table exists...");
  await sql.query(`
    CREATE TABLE IF NOT EXISTS container_types (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      code varchar(32) NOT NULL UNIQUE,
      name varchar(128) NOT NULL,
      category varchar(64) NOT NULL,
      capacity_litres integer NOT NULL,
      compatible_stream varchar(64) DEFAULT 'All Streams' NOT NULL,
      total_stock integer DEFAULT 0 NOT NULL,
      color_code varchar(32) DEFAULT '#00993F' NOT NULL,
      rfid_tracked boolean DEFAULT true NOT NULL,
      description text,
      is_active boolean DEFAULT true NOT NULL,
      created_at timestamp with time zone DEFAULT now() NOT NULL,
      updated_at timestamp with time zone DEFAULT now() NOT NULL,
      is_deleted boolean DEFAULT false NOT NULL,
      deleted_at timestamp with time zone
    );
  `);

  console.log("🌱 3. Seeding container_types...");
  for (const c of initialContainerTypes) {
    await sql.query(
      `
      INSERT INTO container_types (code, name, category, capacity_litres, compatible_stream, total_stock, color_code, rfid_tracked, description)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (code) DO UPDATE SET
        name = EXCLUDED.name,
        category = EXCLUDED.category,
        capacity_litres = EXCLUDED.capacity_litres,
        compatible_stream = EXCLUDED.compatible_stream,
        total_stock = EXCLUDED.total_stock,
        color_code = EXCLUDED.color_code,
        rfid_tracked = EXCLUDED.rfid_tracked,
        description = EXCLUDED.description,
        updated_at = now();
      `,
      [
        c.code,
        c.name,
        c.category,
        c.capacityLitres,
        c.compatibleStream,
        c.totalStock,
        c.colorCode,
        c.rfidTracked,
        c.description,
      ]
    );
  }

  console.log("🌱 4. Seeding physical assets if empty...");
  for (const a of initialPhysicalAssets) {
    await sql.query(
      `
      INSERT INTO assets (asset_tag, name, category, location, condition, purchase_cost)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (asset_tag) DO UPDATE SET
        name = EXCLUDED.name,
        category = EXCLUDED.category,
        location = EXCLUDED.location,
        condition = EXCLUDED.condition,
        purchase_cost = EXCLUDED.purchase_cost,
        updated_at = now();
      `,
      [
        a.assetTag,
        a.name,
        a.category,
        a.location,
        a.condition,
        a.purchaseCost,
      ]
    );
  }

  console.log("✅ Containers, assets, and materials schemas initialized successfully!");
}

if (require.main === module) {
  initContainersAndAssets()
    .then(() => {
      console.log("Done!");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Error initializing containers:", err);
      process.exit(1);
    });
}
