import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { users } from "../server/db/schema";
import { eq } from "drizzle-orm";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const DEMO_PASSWORD = "RafikiDemo2026!";

const demoUsers = [
  {
    fullName: "David Omondi",
    email: "admin@rafikiwaste.co.ke",
    phone: "+254 722 849 101",
    role: "super_admin" as const,
    roleTitle: "Chief Executive Officer & Admin",
    status: "active" as const,
    depotLocation: "Nairobi HQ — Kilimani",
    assignedVehiclePlate: null,
    avatarUrl: "/avatars/david.jpg",
  },
  {
    fullName: "Beatrice Wanjiru",
    email: "operations@rafikiwaste.co.ke",
    phone: "+254 711 450 321",
    role: "operations_manager" as const,
    roleTitle: "Head of Operations & Logistics",
    status: "active" as const,
    depotLocation: "Central Transfer Station",
    assignedVehiclePlate: null,
    avatarUrl: "/avatars/beatrice.jpg",
  },
  {
    fullName: "Mercy Akinyi",
    email: "finance@rafikiwaste.co.ke",
    phone: "+254 734 912 304",
    role: "finance_officer" as const,
    roleTitle: "Finance Lead & Invoicing Controller",
    status: "active" as const,
    depotLocation: "Nairobi HQ — Kilimani",
    assignedVehiclePlate: null,
    avatarUrl: "/avatars/mercy.jpg",
  },
  {
    fullName: "Joseph Mwangi",
    email: "mrf@rafikiwaste.co.ke",
    phone: "+254 720 183 994",
    role: "mrf_operator" as const,
    roleTitle: "MRF Depot & Weighbridge Supervisor",
    status: "active" as const,
    depotLocation: "Central Transfer Station Weighbridge",
    assignedVehiclePlate: null,
    avatarUrl: "/avatars/joseph.jpg",
  },
  {
    fullName: "Faith Chebet",
    email: "fleet@rafikiwaste.co.ke",
    phone: "+254 792 341 088",
    role: "fleet_supervisor" as const,
    roleTitle: "Fleet Workshop & Telemetry Engineer",
    status: "active" as const,
    depotLocation: "Central Workshop & Yard",
    assignedVehiclePlate: null,
    avatarUrl: "/avatars/faith.jpg",
  },
  {
    fullName: "Samuel Kiptoo",
    email: "driver@rafikiwaste.co.ke",
    phone: "+254 728 554 992",
    role: "driver_collector" as const,
    roleTitle: "Lead Compactor Driver (Route R-01)",
    status: "active" as const,
    depotLocation: "Central Transfer Station",
    assignedVehiclePlate: "KDD 482B",
    avatarUrl: "/avatars/samuel.jpg",
  },
  {
    fullName: "Grace Nduta",
    email: "esg@rafikiwaste.co.ke",
    phone: "+254 715 678 901",
    role: "esg_auditor" as const,
    roleTitle: "Circular Economy & ESG Compliance Auditor",
    status: "active" as const,
    depotLocation: "Nairobi HQ — Kilimani",
    assignedVehiclePlate: null,
    avatarUrl: "/avatars/grace.jpg",
  },
  {
    fullName: "Kelvin Mutua",
    email: "newstaff@rafikiwaste.co.ke",
    phone: "+254 799 112 233",
    role: "unassigned" as const,
    roleTitle: "Pending Role Assignment",
    status: "pending_approval" as const,
    depotLocation: "Eastlands MRF Hub",
    assignedVehiclePlate: null,
    avatarUrl: null,
  },
];

async function seed() {
  console.log("=================================================");
  console.log("🌱 Seeding Demo Users into Neon Auth & Database...");
  console.log("Base URL:", process.env.NEON_AUTH_BASE_URL);
  console.log("=================================================");

  const authBaseUrl = process.env.NEON_AUTH_BASE_URL;
  if (!authBaseUrl) {
    throw new Error("NEON_AUTH_BASE_URL is not defined in .env.local");
  }

  for (const u of demoUsers) {
    let authUserId: string | null = null;

    try {
      // 1. Try to register with Neon Auth
      const res = await fetch(`${authBaseUrl}/sign-up/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
        body: JSON.stringify({
          email: u.email,
          password: DEMO_PASSWORD,
          name: u.fullName,
        }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.user?.id) {
        authUserId = data.user.id;
        console.log(`✓ Created Neon Auth user: ${u.email} (ID: ${authUserId})`);
      } else {
        // User may already exist in neon_auth, query neon_auth.user table directly
        const [existingAuthUser] = await sql`
          SELECT id FROM neon_auth.user WHERE email = ${u.email} LIMIT 1
        `;
        if (existingAuthUser?.id) {
          authUserId = existingAuthUser.id as string;
          console.log(`ℹ Neon Auth user already existed: ${u.email} (ID: ${authUserId})`);
        } else {
          console.warn(`⚠ Warning for ${u.email}:`, data?.message || data?.error || res.statusText);
        }
      }
    } catch (err) {
      console.error(`Error registering ${u.email} in Neon Auth:`, err);
    }

    // 2. Insert or update in public.users domain table
    try {
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.email, u.email))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(users)
          .set({
            authUserId: authUserId || existing[0].authUserId,
            fullName: u.fullName,
            phone: u.phone,
            role: u.role,
            roleTitle: u.roleTitle,
            status: u.status,
            depotLocation: u.depotLocation,
            assignedVehiclePlate: u.assignedVehiclePlate,
            avatarUrl: u.avatarUrl,
            updatedAt: new Date(),
          })
          .where(eq(users.id, existing[0].id));
        console.log(`✓ Updated public.users record for: ${u.email}`);
      } else {
        await db.insert(users).values({
          authUserId,
          fullName: u.fullName,
          email: u.email,
          phone: u.phone,
          role: u.role,
          roleTitle: u.roleTitle,
          status: u.status,
          depotLocation: u.depotLocation,
          assignedVehiclePlate: u.assignedVehiclePlate,
          avatarUrl: u.avatarUrl,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        console.log(`✓ Inserted public.users record for: ${u.email}`);
      }
    } catch (dbErr) {
      console.error(`Error saving user record in PostgreSQL for ${u.email}:`, dbErr);
    }
  }

  console.log("\n=================================================");
  console.log("🎉 Seeding complete! All roles successfully provisioned.");
  console.log("=================================================");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
