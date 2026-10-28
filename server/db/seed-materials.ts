import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL || "";
if (!connectionString) {
  console.error("DATABASE_URL is not defined in .env.local");
  process.exit(1);
}

const sql = neon(connectionString);

export const initialMaterials = [
  {
    code: "PET-CLR",
    name: "PET Clear Bottles",
    category: "Rigid Plastic",
    benchmarkPrice: "38.50",
    baleDensity: "220 - 250 kg/bale",
    acceptable: "Clear water and beverage bottles, sorted caps",
    rejects: "Opaque bottles, motor oil containers, PVC labels",
    isVerified: true,
  },
  {
    code: "HDP-RGD",
    name: "HDPE Blow Moulding",
    category: "Rigid Plastic",
    benchmarkPrice: "44.00",
    baleDensity: "180 - 220 kg/bale",
    acceptable: "Milk jugs, shampoo/detergent containers, chemical drums",
    rejects: "Heavy grease contamination, PP bucket lids",
    isVerified: true,
  },
  {
    code: "OCC-CRD",
    name: "Cardboard (OCC Bales)",
    category: "Paper & Fibre",
    benchmarkPrice: "14.50",
    baleDensity: "350 - 450 kg/bale",
    acceptable: "Corrugated shipping boxes, clean industrial cartons",
    rejects: "Waxed produce boxes, wet soggy cardboard",
    isVerified: true,
  },
  {
    code: "ALU-UBC",
    name: "Aluminium Beverage Cans",
    category: "Non-Ferrous Metal",
    benchmarkPrice: "165.00",
    baleDensity: "120 - 150 kg briquettes",
    acceptable: "All soda and beverage cans, clean tin-free",
    rejects: "Aerosol cans, steel food cans",
    isVerified: true,
  },
  {
    code: "ORG-CMP",
    name: "Organic Composting Biomass",
    category: "Organic Waste",
    benchmarkPrice: "12.00",
    baleDensity: "Bulk Windrow (kg/m³)",
    acceptable: "Vegetable scraps, fruit rinds, coffee grounds, garden clippings",
    rejects: "Meat/bones (vermin risk), plastic bags, glass shards",
    isVerified: true,
  },
];

export async function seedMaterials() {
  console.log("🌱 Ensuring waste_materials table exists...");
  await sql.query(`
    CREATE TABLE IF NOT EXISTS waste_materials (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      code varchar(32) NOT NULL UNIQUE,
      name varchar(128) NOT NULL,
      category varchar(64) NOT NULL,
      benchmark_price numeric(10, 2) NOT NULL,
      bale_density varchar(128) NOT NULL,
      acceptable text NOT NULL,
      rejects text NOT NULL,
      is_verified boolean DEFAULT true NOT NULL,
      created_at timestamp with time zone DEFAULT now() NOT NULL,
      updated_at timestamp with time zone DEFAULT now() NOT NULL,
      is_deleted boolean DEFAULT false NOT NULL,
      deleted_at timestamp with time zone
    );
  `);

  console.log("🌱 Seeding waste_materials...");
  for (const m of initialMaterials) {
    await sql.query(
      `
      INSERT INTO waste_materials (code, name, category, benchmark_price, bale_density, acceptable, rejects, is_verified)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (code) DO UPDATE SET
        name = EXCLUDED.name,
        category = EXCLUDED.category,
        benchmark_price = EXCLUDED.benchmark_price,
        bale_density = EXCLUDED.bale_density,
        acceptable = EXCLUDED.acceptable,
        rejects = EXCLUDED.rejects,
        is_verified = EXCLUDED.is_verified,
        updated_at = now();
      `,
      [
        m.code,
        m.name,
        m.category,
        m.benchmarkPrice,
        m.baleDensity,
        m.acceptable,
        m.rejects,
        m.isVerified,
      ]
    );
  }

  console.log("✅ Seeded waste_materials successfully!");
}

if (require.main === module) {
  seedMaterials()
    .then(() => {
      console.log("Done!");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Error seeding materials:", err);
      process.exit(1);
    });
}
