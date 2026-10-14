import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { clients } from "../server/db/schema";
import { eq } from "drizzle-orm";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function main() {
  console.log("Updating collection days for clients...");

  const updates = [
    { name: "Safari Park Hotel & Casino", days: "Monday, Tuesday, Wednesday, Thursday, Friday, Saturday" },
    { name: "Kilimani Palms Heights", days: "Tuesday, Friday" },
    { name: "Brookside International Academy", days: "Monday, Thursday" },
    { name: "Green Terrace Suites", days: "Wednesday, Saturday" },
    { name: "Test", days: "Wednesday" },
    { name: "On deman test client", days: "On-Demand" },
  ];

  for (const item of updates) {
    await db
      .update(clients)
      .set({ collectionDays: item.days })
      .where(eq(clients.name, item.name));
    console.log(`Updated ${item.name} -> ${item.days}`);
  }

  // Also check if other clients from seed exist, if not let's add Java House, EA Bottlers, Mombasa Gov, Amani Mwangi
  const extraClients = [
    {
      accountNumber: "CLT-RES-004",
      name: "Java House — Kimathi Street",
      customerType: "restaurant" as const,
      contactPerson: "Kevin Ouma (Store Ops)",
      email: "kimathi@javahouse.com",
      phone: "+254 720 444 555",
      physicalAddress: "Corner of Kimathi & Mama Ngina St, CBD",
      countyRegion: "Nairobi",
      collectionFrequency: "daily" as const,
      collectionDays: "Monday, Tuesday, Wednesday, Thursday, Friday, Saturday",
      wasteStreams: "Coffee Grounds, Food Waste, PET Cups",
      binCount: "4 x 240L Wheeled Bins",
      monthlyFee: "32000.00",
      currency: "KES",
      isActive: true,
    },
    {
      accountNumber: "CLT-BUS-005",
      name: "East Africa Bottlers Logistics Park",
      customerType: "business" as const,
      contactPerson: "Harrison Kiprono (Supply Chain)",
      email: "hkiprono@eabottlers.co.ke",
      phone: "+254 722 555 666",
      physicalAddress: "Ruaraka Industrial Area, Outer Ring Rd",
      countyRegion: "Nairobi",
      collectionFrequency: "weekly" as const,
      collectionDays: "Monday",
      wasteStreams: "Industrial PET Scraps, Wooden Pallets, Corrugated",
      binCount: "4 x 1100L Steel Skips",
      monthlyFee: "95000.00",
      currency: "KES",
      isActive: true,
    },
    {
      accountNumber: "CLT-GOV-006",
      name: "Mombasa County Urban Sanitation Directorate",
      customerType: "government" as const,
      contactPerson: "Eng. Farouk Salim (Director Environment)",
      email: "environment@mombasa.go.ke",
      phone: "+254 733 666 777",
      physicalAddress: "Treasury Square, Old Town, Mombasa",
      countyRegion: "Mombasa",
      collectionFrequency: "daily" as const,
      collectionDays: "Monday, Tuesday, Wednesday, Thursday, Friday, Saturday",
      wasteStreams: "Municipal Mixed Solid Waste & Ocean Debris",
      binCount: "12 x Static Heavy Roll-on Skips",
      monthlyFee: "320000.00",
      currency: "KES",
      isActive: true,
    },
    {
      accountNumber: "CLT-HOU-007",
      name: "Dr. Amani Mwangi Villa",
      customerType: "household" as const,
      contactPerson: "Dr. Amani Mwangi",
      email: "amani.mwangi@gmail.com",
      phone: "+254 721 777 888",
      physicalAddress: "Karen Plains Close, Nairobi",
      countyRegion: "Nairobi",
      collectionFrequency: "weekly" as const,
      collectionDays: "Friday",
      wasteStreams: "Sorted Organics & Recyclables",
      binCount: "2 x 240L Bins",
      monthlyFee: "4500.00",
      currency: "KES",
      isActive: true,
    },
  ];

  for (const c of extraClients) {
    const existing = await db.select().from(clients).where(eq(clients.accountNumber, c.accountNumber)).limit(1);
    if (existing.length === 0) {
      await db.insert(clients).values(c);
      console.log(`Inserted extra client: ${c.name}`);
    } else {
      await db.update(clients).set({ collectionDays: c.collectionDays }).where(eq(clients.id, existing[0].id));
      console.log(`Updated client: ${c.name} -> ${c.collectionDays}`);
    }
  }

  console.log("Done updating client collection days!");
}

main().catch(console.error);
