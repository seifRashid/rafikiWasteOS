import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { clients, collectionJobs, invoices, users } from "../server/db/schema";
import { eq } from "drizzle-orm";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const DEMO_PASSWORD = "RafikiDemo2026!";

async function seed() {
  console.log("🌱 Seeding Operational Clients, Collections, Invoices and Client Portal User...");

  // 1. Seed or Upsert Key Clients
  const clientData = [
    {
      accountNumber: "CLT-HTL-001",
      name: "Safari Park Hotel & Casino",
      customerType: "hotel" as const,
      contactPerson: "David Kariuki (Head of Facilities)",
      email: "client@safaripark.co.ke",
      phone: "+254 722 111 222",
      latitude: "-1.222384",
      longitude: "36.878912",
      physicalAddress: "Thika Road, Kasarani, Nairobi",
      countyRegion: "Nairobi",
      collectionFrequency: "daily" as const,
      wasteStreams: "Organic (Kitchen & Banquet), Recyclable (Glass & PET Bottles)",
      binCount: "16 x 240L Wheeled Bins + 2 Bulk Skips",
      contractStartDate: "2026-01-01",
      contractEndDate: "2027-12-31",
      monthlyFee: "45000.00",
      currency: "KES",
      isActive: true,
      notes: "High-priority hospitality account with daily early-morning collections",
    },
    {
      accountNumber: "CLT-APT-002",
      name: "Kilimani Palms Heights",
      customerType: "apartment" as const,
      contactPerson: "Beatrice Mutua (Property Manager)",
      email: "manager@kilimanipalms.com",
      phone: "+254 733 222 333",
      latitude: "-1.289120",
      longitude: "36.786540",
      physicalAddress: "Argwings Kodhek Rd, Kilimani, Nairobi",
      countyRegion: "Nairobi",
      collectionFrequency: "twice_weekly" as const,
      wasteStreams: "Organic, Cardboard, Mixed Plastics",
      binCount: "8 x 240L Color-Coded Bins",
      contractStartDate: "2026-02-15",
      contractEndDate: "2027-02-14",
      monthlyFee: "28000.00",
      currency: "KES",
      isActive: true,
      notes: "Residential apartment complex (120 units)",
    },
    {
      accountNumber: "CLT-SCH-003",
      name: "Brookside International Academy",
      customerType: "school" as const,
      contactPerson: "Sister Agnes Waweru",
      email: "bursar@brooksideacademy.ac.ke",
      phone: "+254 711 333 444",
      latitude: "-1.258900",
      longitude: "36.792300",
      physicalAddress: "Spring Valley Rd, Westlands, Nairobi",
      countyRegion: "Nairobi",
      collectionFrequency: "twice_weekly" as const,
      wasteStreams: "Paper/Cardboard, Food Scraps, Plastic Bins",
      binCount: "12 x 240L Wheeled Bins",
      contractStartDate: "2026-01-10",
      contractEndDate: "2026-12-31",
      monthlyFee: "35000.00",
      currency: "KES",
      isActive: true,
      notes: "Active Eco-Schools recycling champion",
    },
  ];

  const savedClients: Record<string, string> = {};

  for (const c of clientData) {
    const existing = await db
      .select()
      .from(clients)
      .where(eq(clients.accountNumber, c.accountNumber))
      .limit(1);

    if (existing.length > 0) {
      savedClients[c.accountNumber] = existing[0].id;
      console.log(`ℹ Client exists: ${c.name} (${existing[0].id})`);
    } else {
      const [inserted] = await db.insert(clients).values(c).returning();
      savedClients[c.accountNumber] = inserted.id;
      console.log(`✓ Created client: ${c.name} (${inserted.id})`);
    }
  }

  const safariParkId = savedClients["CLT-HTL-001"];

  // 2. Seed Real Collection Jobs for Safari Park Hotel
  const jobsData = [
    {
      jobNumber: "JOB-2026-0901",
      clientId: safariParkId,
      driverName: "Samuel Kiptoo",
      wasteStream: "organic" as const,
      stopSequence: 1,
      expectedQuantityKg: "1200.00",
      grossWeightKg: "11850.00",
      tareWeightKg: "10550.00",
      actualWeightKg: "1300.00",
      scheduledAt: new Date(Date.now() - 2 * 24 * 3600 * 1000),
      collectedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000 + 3600 * 1000),
      deliveredAt: new Date(Date.now() - 2 * 24 * 3600 * 1000 + 7200 * 1000),
      status: "completed" as const,
      gpsLatitude: "-1.222384",
      gpsLongitude: "36.878912",
      binCondition: "Normal",
      clientSignatureName: "D. Kariuki",
      notes: "Full breakfast organic waste cleared from main kitchen & banquet hall. Diverted to central composting.",
    },
    {
      jobNumber: "JOB-2026-0902",
      clientId: safariParkId,
      driverName: "Samuel Kiptoo",
      wasteStream: "recyclable" as const,
      stopSequence: 2,
      expectedQuantityKg: "650.00",
      grossWeightKg: "11240.00",
      tareWeightKg: "10550.00",
      actualWeightKg: "690.00",
      scheduledAt: new Date(Date.now() - 1 * 24 * 3600 * 1000),
      collectedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000 + 3600 * 1000),
      deliveredAt: new Date(Date.now() - 1 * 24 * 3600 * 1000 + 7200 * 1000),
      status: "completed" as const,
      gpsLatitude: "-1.222384",
      gpsLongitude: "36.878912",
      binCondition: "Normal",
      clientSignatureName: "D. Kariuki",
      notes: "Beverage glass bottles and baled clear PET collected from banquet receiving bay.",
    },
    {
      jobNumber: "JOB-2026-0903",
      clientId: safariParkId,
      driverName: "Samuel Kiptoo",
      wasteStream: "organic" as const,
      stopSequence: 1,
      expectedQuantityKg: "1100.00",
      grossWeightKg: "11680.00",
      tareWeightKg: "10550.00",
      actualWeightKg: "1130.00",
      scheduledAt: new Date(Date.now() - 6 * 3600 * 1000),
      collectedAt: new Date(Date.now() - 5 * 3600 * 1000),
      deliveredAt: new Date(Date.now() - 4 * 3600 * 1000),
      status: "completed" as const,
      gpsLatitude: "-1.222384",
      gpsLongitude: "36.878912",
      binCondition: "Normal",
      clientSignatureName: "D. Kariuki",
      notes: "Morning organic collection. Bins washed and sanitized after emptying.",
    },
    {
      jobNumber: "JOB-2026-0904",
      clientId: safariParkId,
      driverName: "Samuel Kiptoo",
      wasteStream: "recyclable" as const,
      stopSequence: 2,
      expectedQuantityKg: "500.00",
      grossWeightKg: null,
      tareWeightKg: null,
      actualWeightKg: null,
      scheduledAt: new Date(Date.now() + 18 * 3600 * 1000), // Tomorrow morning
      status: "scheduled" as const,
      gpsLatitude: "-1.222384",
      gpsLongitude: "36.878912",
      binCondition: "Normal",
      notes: "Scheduled upcoming recyclables pickup (cardboard OCC + plastics).",
    },
    {
      jobNumber: "JOB-2026-0905",
      clientId: safariParkId,
      driverName: "Samuel Kiptoo",
      wasteStream: "organic" as const,
      stopSequence: 1,
      expectedQuantityKg: "1200.00",
      grossWeightKg: null,
      tareWeightKg: null,
      actualWeightKg: null,
      scheduledAt: new Date(Date.now() + 42 * 3600 * 1000), // Day after tomorrow
      status: "scheduled" as const,
      gpsLatitude: "-1.222384",
      gpsLongitude: "36.878912",
      binCondition: "Normal",
      notes: "Upcoming routine organic waste morning run.",
    },
  ];

  for (const j of jobsData) {
    const existing = await db
      .select()
      .from(collectionJobs)
      .where(eq(collectionJobs.jobNumber, j.jobNumber))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(collectionJobs).values(j);
      console.log(`✓ Inserted collection job: ${j.jobNumber}`);
    }
  }

  // 3. Seed Real Invoices for Safari Park Hotel
  const invoicesData = [
    {
      invoiceNumber: "INV-2026-0089",
      clientId: safariParkId,
      amount: "45000.00",
      currency: "KES",
      status: "paid" as const,
      billingPeriod: "August 2026",
      issueDate: "2026-08-01",
      dueDate: "2026-08-15",
      paidDate: "2026-08-12",
      paymentMethod: "Bank Wire (KCB Transfer)",
      paymentReference: "KCB-TX-9921448",
      notes: "Full monthly service contract payment received.",
    },
    {
      invoiceNumber: "INV-2026-0112",
      clientId: safariParkId,
      amount: "45000.00",
      currency: "KES",
      status: "paid" as const,
      billingPeriod: "September 2026",
      issueDate: "2026-09-01",
      dueDate: "2026-09-15",
      paidDate: "2026-09-14",
      paymentMethod: "M-Pesa Business Till #892110",
      paymentReference: "QKL89102XN",
      notes: "September commercial waste handling fee.",
    },
    {
      invoiceNumber: "INV-2026-0145",
      clientId: safariParkId,
      amount: "45000.00",
      currency: "KES",
      status: "pending" as const,
      billingPeriod: "October 2026",
      issueDate: "2026-10-01",
      dueDate: "2026-10-15",
      paidDate: null,
      paymentMethod: null,
      paymentReference: null,
      notes: "Current month invoice due on 15th October.",
    },
  ];

  for (const inv of invoicesData) {
    const existing = await db
      .select()
      .from(invoices)
      .where(eq(invoices.invoiceNumber, inv.invoiceNumber))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(invoices).values(inv);
      console.log(`✓ Inserted invoice: ${inv.invoiceNumber}`);
    }
  }

  // 4. Provision Neon Auth & PostgreSQL User for Client Portal Demo
  const clientEmail = "client@safaripark.co.ke";
  const authBaseUrl = process.env.NEON_AUTH_BASE_URL;
  let authUserId: string | null = null;

  if (authBaseUrl) {
    try {
      const res = await fetch(`${authBaseUrl}/sign-up/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
        body: JSON.stringify({
          email: clientEmail,
          password: DEMO_PASSWORD,
          name: "David Kariuki",
        }),
      });

      const data = await res.json().catch(() => null);
      if (res.ok && data?.user?.id) {
        authUserId = data.user.id;
        console.log(`✓ Created Neon Auth user: ${clientEmail} (${authUserId})`);
      } else {
        const [existingAuth] = await sql`
          SELECT id FROM neon_auth.user WHERE email = ${clientEmail} LIMIT 1
        `;
        if (existingAuth?.id) {
          authUserId = existingAuth.id as string;
          console.log(`ℹ Neon Auth user exists: ${clientEmail} (${authUserId})`);
        }
      }
    } catch (err) {
      console.warn("Neon Auth signup warning:", err);
    }
  }

  // Insert or update public.users record linked directly to safariParkId
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, clientEmail))
    .limit(1);

  if (existingUser.length > 0) {
    await db
      .update(users)
      .set({
        clientId: safariParkId,
        authUserId: authUserId || existingUser[0].authUserId,
        role: "client_admin",
        roleTitle: "Client Facilities & Sustainability Admin",
        status: "active",
        updatedAt: new Date(),
      })
      .where(eq(users.id, existingUser[0].id));
    console.log(`✓ Updated public.users record for client portal user: ${clientEmail}`);
  } else {
    await db.insert(users).values({
      authUserId,
      clientId: safariParkId,
      fullName: "David Kariuki",
      email: clientEmail,
      phone: "+254 722 111 222",
      role: "client_admin",
      roleTitle: "Client Facilities & Sustainability Admin",
      status: "active",
      depotLocation: "Safari Park Hotel Premises",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(`✓ Inserted client portal user record: ${clientEmail}`);
  }

  console.log("\n🎉 Operational data and Client Portal user successfully seeded!");
  console.log(`Login credentials for Client Portal:`);
  console.log(`  Email:    ${clientEmail}`);
  console.log(`  Password: ${DEMO_PASSWORD}`);
  console.log(`  Client:   Safari Park Hotel & Casino (CLT-HTL-001)`);
}

seed().catch((err) => {
  console.error("Seeding operational data failed:", err);
  process.exit(1);
});
