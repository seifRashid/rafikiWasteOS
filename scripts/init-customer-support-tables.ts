import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

if (!connectionString) {
  console.error("No DATABASE_URL found.");
  process.exit(1);
}

const sql = neon(connectionString);

async function main() {
  console.log("🛠️ Initializing customer_requests and customer_complaints tables...");

  await sql`
    CREATE TABLE IF NOT EXISTS customer_requests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      ticket_number VARCHAR(32) NOT NULL UNIQUE,
      client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      type VARCHAR(128) NOT NULL,
      subject TEXT NOT NULL,
      details TEXT NOT NULL,
      priority VARCHAR(32) NOT NULL DEFAULT 'normal',
      status VARCHAR(32) NOT NULL DEFAULT 'pending',
      preferred_date DATE,
      admin_notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      is_deleted BOOLEAN NOT NULL DEFAULT FALSE
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS customer_complaints (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      ticket_number VARCHAR(32) NOT NULL UNIQUE,
      client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      category VARCHAR(128) NOT NULL,
      subject TEXT NOT NULL,
      description TEXT NOT NULL,
      priority VARCHAR(32) NOT NULL DEFAULT 'medium',
      status VARCHAR(32) NOT NULL DEFAULT 'open',
      assigned_to TEXT,
      resolution_notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      is_deleted BOOLEAN NOT NULL DEFAULT FALSE
    );
  `;

  // Seed demo initial tickets if empty so admin and client demo dashboards show real records
  const existingReqs = await sql`SELECT count(*) FROM customer_requests WHERE is_deleted = false;`;
  const existingCount = parseInt(existingReqs[0]?.count || "0", 10);

  if (existingCount === 0) {
    const safariPark = await sql`SELECT id FROM clients WHERE account_number = 'CLT-HTL-001' LIMIT 1;`;
    const kilimani = await sql`SELECT id FROM clients WHERE account_number = 'CLT-APT-002' LIMIT 1;`;
    const brookside = await sql`SELECT id FROM clients WHERE account_number = 'CLT-SCH-004' LIMIT 1;`;

    const safariId = safariPark[0]?.id;
    const kilimaniId = kilimani[0]?.id;
    const brooksideId = brookside[0]?.id || safariId;

    if (safariId) {
      await sql`
        INSERT INTO customer_requests (ticket_number, client_id, type, subject, details, priority, status, preferred_date)
        VALUES 
          ('REQ-2026-0192', ${safariId}, 'Extra Bulk Organic Collection', 'Urgent Afternoon Compactor Run', 'Major wedding conference catering tonight. Requesting emergency afternoon compactor run for kitchen waste.', 'high', 'pending', CURRENT_DATE),
          ('REQ-2026-0195', ${safariId}, 'Additional Bins Request', 'Requesting 2 Extra 240L Glass Bins', 'Bar inventory expansion requires 2 additional green wheeled bins for banquet hall.', 'normal', 'completed', CURRENT_DATE - INTERVAL '3 days');
      `;
    }

    if (brooksideId) {
      await sql`
        INSERT INTO customer_requests (ticket_number, client_id, type, subject, details, priority, status, preferred_date)
        VALUES 
          ('REQ-2026-0193', ${brooksideId}, 'Additional Bins Request', '2 Additional 240L Plastic Recycling Bins', 'New term enrollment expansion. Requesting two green recycling bins for junior block.', 'medium', 'assigned', CURRENT_DATE + INTERVAL '1 day');
      `;
    }

    if (kilimaniId) {
      await sql`
        INSERT INTO customer_complaints (ticket_number, client_id, category, subject, description, priority, status, assigned_to)
        VALUES 
          ('CMP-2026-081', ${kilimaniId}, 'Damaged Container', 'Bin Wheel Damaged During Tipping', 'During Tuesday morning compactor lift, right caster wheel snapped. Bin cannot roll to curbside.', 'high', 'in_progress', 'Julien Ochieng (Depot Maintenance)');
      `;
    }

    if (safariId) {
      await sql`
        INSERT INTO customer_complaints (ticket_number, client_id, category, subject, description, priority, status, assigned_to)
        VALUES 
          ('CMP-2026-085', ${safariId}, 'Missed Stop', 'Compactor Missed Loading Dock 2', 'Early morning run collected primary compactor but bypassed service bay 2 near pastry kitchen.', 'high', 'open', 'Mohammed Bakari (Operations Dispatch)');
      `;
    }

    console.log("✅ Seeded demo requests and complaints.");
  }

  console.log("✅ Customer Support tables verified and ready.");
}

main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
