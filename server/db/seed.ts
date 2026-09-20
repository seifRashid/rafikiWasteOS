import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as dotenv from "dotenv";
import * as schema from "./schema";

dotenv.config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL || "";
if (!connectionString) {
  console.error("DATABASE_URL is not defined in .env.local");
  process.exit(1);
}

const sql = neon(connectionString);
const db = drizzle(sql, { schema });

export async function seedDatabase() {
  console.log("🌱 Starting Rafiki WasteOS Database Seeding...");

  // 1. Clear existing data in reverse dependency order
  console.log("Cleaning existing records...");
  await db.delete(schema.collectionJobs);
  await db.delete(schema.routes);
  await db.delete(schema.recyclableInventory);
  await db.delete(schema.invoices);
  await db.delete(schema.expenses);
  await db.delete(schema.assets);
  await db.delete(schema.vehicles);
  await db.delete(schema.clients);
  await db.delete(schema.projects);

  // 2. Insert Fleet Vehicles
  console.log("Inserting fleet vehicles...");
  const insertedVehicles = await db
    .insert(schema.vehicles)
    .values([
      {
        plateNumber: "KDD 482B",
        model: "Isuzu FVZ 1400 Compactor (20m³)",
        type: "compactor_truck",
        capacityKg: "12000.00",
        currentMileageKm: 118650,
        nextServiceKm: 119000, // Service due in 350 km! (Alert trigger)
        assignedDriverName: "Mohammed Bakari",
        assignedDriverPhone: "+254 712 345 678",
        fuelLevelPercent: 68,
        status: "active",
        insuranceExpiryDate: "2027-04-15",
        inspectionExpiryDate: "2027-02-28",
        depotLocation: "Central Transfer Station - Industrial Area",
      },
      {
        plateNumber: "KDE 912K",
        model: "FAW 8.140 Flatbed with Palfinger Crane",
        type: "flatbed_truck",
        capacityKg: "8000.00",
        currentMileageKm: 84200,
        nextServiceKm: 90000,
        assignedDriverName: "Julien Ochieng",
        assignedDriverPhone: "+254 723 456 789",
        fuelLevelPercent: 85,
        status: "in_transit",
        insuranceExpiryDate: "2027-06-30",
        inspectionExpiryDate: "2027-05-15",
        depotLocation: "Kilimani Sub-Depot",
      },
      {
        plateNumber: "KDA 304M",
        model: "Bajaj Maxima Heavy Cargo Tuk-Tuk",
        type: "tuk_tuk_cargo",
        capacityKg: "850.00",
        currentMileageKm: 19400,
        nextServiceKm: 22000,
        assignedDriverName: "Brian Otieno",
        assignedDriverPhone: "+254 734 567 890",
        fuelLevelPercent: 42,
        status: "active",
        insuranceExpiryDate: "2027-08-10",
        inspectionExpiryDate: "2027-07-01",
        depotLocation: "Mombasa Old Town Hub",
      },
      {
        plateNumber: "KDF 118P",
        model: "Scania P280 6x2 Hookloader / Skip Loader",
        type: "skip_loader",
        capacityKg: "16000.00",
        currentMileageKm: 142100,
        nextServiceKm: 145000,
        assignedDriverName: "Grace Wanjiku",
        assignedDriverPhone: "+254 745 678 901",
        fuelLevelPercent: 90,
        status: "active",
        insuranceExpiryDate: "2027-09-20",
        inspectionExpiryDate: "2027-08-15",
        depotLocation: "Mombasa Road MRF Yard",
      },
    ])
    .returning();

  const truck1 = insertedVehicles[0];
  const truck2 = insertedVehicles[1];
  const tuktuk = insertedVehicles[2];

  // 3. Insert Clients
  console.log("Inserting clients across tiers...");
  const insertedClients = await db
    .insert(schema.clients)
    .values([
      {
        accountNumber: "CLT-HTL-001",
        name: "Safari Park Hotel & Casino",
        customerType: "hotel",
        contactPerson: "David Kariuki (Head of Facilities)",
        email: "facilities@safaripark.co.ke",
        phone: "+254 722 111 222",
        latitude: "-1.222384",
        longitude: "36.878912",
        physicalAddress: "Thika Road, Kasarani, Nairobi",
        countyRegion: "Nairobi",
        collectionFrequency: "daily",
        wasteStreams: "Organic (Kitchen), Recyclable (Glass & PET)",
        binCount: "16 x 240L Wheeled Bins + 2 x 1100L Skips",
        contractStartDate: "2026-01-01",
        contractEndDate: "2027-12-31",
        monthlyFee: "45000.00",
        currency: "KES",
        isActive: true,
      },
      {
        accountNumber: "CLT-APT-002",
        name: "Kilimani Palms Heights",
        customerType: "apartment",
        contactPerson: "Beatrice Mutua (Property Manager)",
        email: "manager@kilimanipalms.com",
        phone: "+254 733 222 333",
        latitude: "-1.289120",
        longitude: "36.786540",
        physicalAddress: "Argwings Kodhek Rd, Kilimani, Nairobi",
        countyRegion: "Nairobi",
        collectionFrequency: "twice_weekly",
        wasteStreams: "Organic, Cardboard, Mixed Plastic",
        binCount: "8 x 240L Wheeled Bins",
        contractStartDate: "2026-02-15",
        contractEndDate: "2027-02-14",
        monthlyFee: "28000.00",
        currency: "KES",
        isActive: true,
      },
      {
        accountNumber: "CLT-SCH-003",
        name: "Brookside International Academy",
        customerType: "school",
        contactPerson: "Sister Agnes Waweru",
        email: "bursar@brooksideacademy.ac.ke",
        phone: "+254 711 333 444",
        latitude: "-1.258900",
        longitude: "36.792300",
        physicalAddress: "Spring Valley Rd, Westlands, Nairobi",
        countyRegion: "Nairobi",
        collectionFrequency: "twice_weekly",
        wasteStreams: "Paper/Cardboard, Food Scraps, Plastic Bins",
        binCount: "12 x 240L Color-Coded Bins",
        contractStartDate: "2026-01-10",
        contractEndDate: "2026-12-31",
        monthlyFee: "35000.00",
        currency: "KES",
        isActive: true,
      },
      {
        accountNumber: "CLT-RES-004",
        name: "Java House — Kimathi Street",
        customerType: "restaurant",
        contactPerson: "Kevin Ouma (Store Ops)",
        email: "kimathi@javahouse.com",
        phone: "+254 720 444 555",
        latitude: "-1.284500",
        longitude: "36.822800",
        physicalAddress: "Corner of Kimathi & Mama Ngina St, CBD",
        countyRegion: "Nairobi",
        collectionFrequency: "daily",
        wasteStreams: "Coffee Grounds, Food Waste, PET Cups",
        binCount: "4 x 240L Wheeled Bins",
        contractStartDate: "2026-03-01",
        contractEndDate: "2027-02-28",
        monthlyFee: "32000.00",
        currency: "KES",
        isActive: true,
      },
      {
        accountNumber: "CLT-BUS-005",
        name: "East Africa Bottlers Logistics Park",
        customerType: "business",
        contactPerson: "Harrison Kiprono (Supply Chain)",
        email: "hkiprono@eabottlers.co.ke",
        phone: "+254 722 555 666",
        latitude: "-1.240100",
        longitude: "36.868700",
        physicalAddress: "Ruaraka Industrial Area, Outer Ring Rd",
        countyRegion: "Nairobi",
        collectionFrequency: "weekly",
        wasteStreams: "Industrial PET Scraps, Wooden Pallets, Corrugated",
        binCount: "4 x 1100L Steel Skips",
        contractStartDate: "2026-01-01",
        contractEndDate: "2028-01-01",
        monthlyFee: "95000.00",
        currency: "KES",
        isActive: true,
      },
      {
        accountNumber: "CLT-GOV-006",
        name: "Mombasa County Urban Sanitation Directorate",
        customerType: "government",
        contactPerson: "Eng. Farouk Salim (Director Environment)",
        email: "environment@mombasa.go.ke",
        phone: "+254 733 666 777",
        latitude: "-4.061200",
        longitude: "39.670500",
        physicalAddress: "Treasury Square, Old Town, Mombasa",
        countyRegion: "Mombasa",
        collectionFrequency: "daily",
        wasteStreams: "Municipal Mixed Solid Waste & Ocean Debris",
        binCount: "12 x Static Heavy Roll-on Skips",
        contractStartDate: "2026-02-01",
        contractEndDate: "2027-01-31",
        monthlyFee: "320000.00",
        currency: "KES",
        isActive: true,
      },
      {
        accountNumber: "CLT-HOU-007",
        name: "Dr. Amani Mwangi Villa",
        customerType: "household",
        contactPerson: "Dr. Amani Mwangi",
        email: "amani.mwangi@gmail.com",
        phone: "+254 721 777 888",
        latitude: "-1.319500",
        longitude: "36.711200",
        physicalAddress: "Karen Plains Close, Nairobi",
        countyRegion: "Nairobi",
        collectionFrequency: "weekly",
        wasteStreams: "Sorted Organics & Recyclables",
        binCount: "2 x 240L Bins",
        contractStartDate: "2026-04-01",
        contractEndDate: "2027-03-31",
        monthlyFee: "4500.00",
        currency: "KES",
        isActive: true,
      },
    ])
    .returning();

  const [safariHotel, kilimaniPalms, brooksideSchool, javaHouse, eaBottlers, mombasaGov, amaniHousehold] = insertedClients;

  // 4. Insert Daily Routes
  console.log("Inserting daily routes...");
  const today = new Date().toISOString().split("T")[0];
  const insertedRoutes = await db
    .insert(schema.routes)
    .values([
      {
        routeCode: "RT-NAI-01",
        name: "Westlands & Commercial Hotel Route",
        vehicleId: truck1.id,
        driverName: "Mohammed Bakari",
        driverPhone: "+254 712 345 678",
        crewNames: "Peter Maina, Samuel Kipkorir",
        routeDate: today,
        status: "in_progress",
        totalStops: 12,
        completedStops: 8,
        totalDistanceKm: "42.50",
        fuelUsedLitres: "18.40",
        startDepot: "Industrial Area Depot",
        endDestination: "Mombasa Road MRF & Weighbridge",
      },
      {
        routeCode: "RT-NAI-02",
        name: "Kilimani & Lavington Residential Circuit",
        vehicleId: truck2.id,
        driverName: "Julien Ochieng",
        driverPhone: "+254 723 456 789",
        crewNames: "Jackson Mutua, Dennis Kiprono",
        routeDate: today,
        status: "in_progress",
        totalStops: 14,
        completedStops: 11,
        totalDistanceKm: "38.20",
        fuelUsedLitres: "14.60",
        startDepot: "Kilimani Sub-Depot",
        endDestination: "Mombasa Road MRF & Weighbridge",
      },
      {
        routeCode: "RT-MSA-01",
        name: "Mombasa Old Town & Marine Waterfront Loop",
        vehicleId: tuktuk.id,
        driverName: "Brian Otieno",
        driverPhone: "+254 734 567 890",
        crewNames: "Hussein Omar",
        routeDate: today,
        status: "planned",
        totalStops: 8,
        completedStops: 0,
        totalDistanceKm: "16.80",
        fuelUsedLitres: "4.20",
        startDepot: "Old Town Hub",
        endDestination: "Kibarani Circular Transfer Station",
      },
    ])
    .returning();

  const route1 = insertedRoutes[0];
  const route2 = insertedRoutes[1];

  // 5. Insert Collection Jobs
  console.log("Inserting collection jobs...");
  const now = new Date();
  const morning8am = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0);
  const morning9am = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 30);
  const morning11am = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 11, 15);
  const afternoon2pm = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0);

  const insertedJobs = await db
    .insert(schema.collectionJobs)
    .values([
      {
        jobNumber: "JOB-2026-0891",
        clientId: safariHotel.id,
        routeId: route1.id,
        vehicleId: truck1.id,
        driverName: "Mohammed Bakari",
        wasteStream: "organic",
        stopSequence: 1,
        expectedQuantityKg: "1200.00",
        grossWeightKg: "11850.00",
        tareWeightKg: "10550.00",
        actualWeightKg: "1300.00",
        scheduledAt: morning8am,
        collectedAt: morning8am,
        deliveredAt: morning9am,
        status: "completed",
        gpsLatitude: "-1.222384",
        gpsLongitude: "36.878912",
        binCondition: "Normal",
        clientSignatureName: "D. Kariuki",
        notes: "Full breakfast organic waste cleared, 6 food drums composted.",
      },
      {
        jobNumber: "JOB-2026-0892",
        clientId: brooksideSchool.id,
        routeId: route1.id,
        vehicleId: truck1.id,
        driverName: "Mohammed Bakari",
        wasteStream: "recyclable",
        stopSequence: 2,
        expectedQuantityKg: "450.00",
        grossWeightKg: "11020.00",
        tareWeightKg: "10550.00",
        actualWeightKg: "470.00",
        scheduledAt: morning9am,
        collectedAt: morning9am,
        deliveredAt: morning11am,
        status: "completed",
        gpsLatitude: "-1.258900",
        gpsLongitude: "36.792300",
        binCondition: "Normal",
        clientSignatureName: "Sister Agnes",
        notes: "Classroom cardboard and sorted PET water bottles.",
      },
      {
        jobNumber: "JOB-2026-0893",
        clientId: javaHouse.id,
        routeId: route1.id,
        vehicleId: truck1.id,
        driverName: "Mohammed Bakari",
        wasteStream: "organic",
        stopSequence: 3,
        expectedQuantityKg: "300.00",
        actualWeightKg: "320.00",
        scheduledAt: morning11am,
        collectedAt: morning11am,
        status: "collected",
        gpsLatitude: "-1.284500",
        gpsLongitude: "36.822800",
        binCondition: "Normal",
        notes: "In transit to MRF weighbridge.",
      },
      {
        jobNumber: "JOB-2026-0894",
        clientId: kilimaniPalms.id,
        routeId: route2.id,
        vehicleId: truck2.id,
        driverName: "Julien Ochieng",
        wasteStream: "recyclable",
        stopSequence: 1,
        expectedQuantityKg: "500.00",
        actualWeightKg: "540.00",
        scheduledAt: morning9am,
        collectedAt: morning9am,
        status: "delivered",
        gpsLatitude: "-1.289120",
        gpsLongitude: "36.786540",
        binCondition: "Normal",
        notes: "Delivered to sorting conveyor Bay 02.",
      },
      {
        jobNumber: "JOB-2026-0895",
        clientId: eaBottlers.id,
        routeId: route1.id,
        vehicleId: truck1.id,
        driverName: "Mohammed Bakari",
        wasteStream: "recyclable",
        stopSequence: 4,
        expectedQuantityKg: "2800.00",
        scheduledAt: afternoon2pm,
        status: "in_progress",
        gpsLatitude: "-1.240100",
        gpsLongitude: "36.868700",
        binCondition: "Normal",
        notes: "Compactor en route, currently at Outer Ring Rd.",
      },
      {
        jobNumber: "JOB-2026-0896",
        clientId: amaniHousehold.id,
        routeId: route2.id,
        vehicleId: truck2.id,
        driverName: "Julien Ochieng",
        wasteStream: "organic",
        stopSequence: 5,
        expectedQuantityKg: "45.00",
        scheduledAt: afternoon2pm,
        status: "scheduled",
        gpsLatitude: "-1.319500",
        gpsLongitude: "36.711200",
        notes: "Upcoming residential pickup.",
      },
    ])
    .returning();

  // 6. Insert Recyclable Material Inventory
  console.log("Inserting recyclable inventory material-flows...");
  await db.insert(schema.recyclableInventory).values([
    {
      batchNumber: "BAT-PET-2026-001",
      materialType: "pet_plastic",
      gradeQuality: "Grade A (Clear)",
      collectedWeightKg: "4500.00",
      sortedWeightKg: "4100.00",
      rejectedWeightKg: "400.00", // 400 kg sorting shrinkage
      currentWeightKg: "600.00",
      stage: "stored",
      storageBay: "Bay 01 - Baled Clear PET",
      buyerName: "EcoPlast Converters Ltd",
      unitSellingPrice: "38.50", // KES 38.50 per kg
      totalRevenue: "134750.00", // Sold 3,500 kg
      notes: "Baled on Bramidan press at 220kg/bale. Highly sorted beverage bottles.",
    },
    {
      batchNumber: "BAT-HDP-2026-002",
      materialType: "hdpe_plastic",
      gradeQuality: "Blow Moulding Rigids",
      collectedWeightKg: "2800.00",
      sortedWeightKg: "2650.00",
      rejectedWeightKg: "150.00",
      currentWeightKg: "1400.00",
      stage: "processed",
      storageBay: "Bay 02 - Flaked HDPE Drums",
      buyerName: "KenPoly Manufacturers",
      unitSellingPrice: "44.00",
      totalRevenue: "55000.00",
      notes: "Shredded and washed, prepared for extrusion.",
    },
    {
      batchNumber: "BAT-OCC-2026-003",
      materialType: "cardboard_occ",
      gradeQuality: "Old Corrugated Containers",
      collectedWeightKg: "6200.00",
      sortedWeightKg: "5950.00",
      rejectedWeightKg: "250.00",
      currentWeightKg: "2100.00",
      stage: "stored",
      storageBay: "Bay 04 - Dry Cardboard Warehouse",
      buyerName: "Chandaria Paper Mills",
      unitSellingPrice: "14.50",
      totalRevenue: "55825.00",
      notes: "Clean supermarket and industrial corrugated packaging.",
    },
    {
      batchNumber: "BAT-ALU-2026-004",
      materialType: "aluminium_cans",
      gradeQuality: "Used Beverage Cans (UBC)",
      collectedWeightKg: "950.00",
      sortedWeightKg: "920.00",
      rejectedWeightKg: "30.00",
      currentWeightKg: "450.00",
      stage: "stored",
      storageBay: "Vault 01 - Non-Ferrous Metals",
      buyerName: "Alupack Smelters Mombasa",
      unitSellingPrice: "165.00",
      totalRevenue: "77550.00",
      notes: "Crushed UBC briquettes, pure beverage aluminium.",
    },
    {
      batchNumber: "BAT-ORG-2026-005",
      materialType: "organic_compost",
      gradeQuality: "Mature Soil Conditioner",
      collectedWeightKg: "18500.00",
      sortedWeightKg: "16800.00",
      rejectedWeightKg: "1700.00",
      currentWeightKg: "12500.00",
      stage: "processed",
      storageBay: "Windrow 03 - Organic Yard",
      buyerName: "Naivasha Greenhouses Agro Ltd",
      unitSellingPrice: "12.00",
      totalRevenue: "51600.00",
      notes: "Thermophilic windrow composting at 62°C, weed-seed free.",
    },
  ]);

  // 7. Insert Invoices & Expenses & Projects
  console.log("Inserting finance & project accounting records...");
  const insertedProject = await db
    .insert(schema.projects)
    .values({
      projectCode: "PRJ-MSA-2026",
      name: "Mombasa Marine Plastic Interceptor & Recycling Initiative",
      donorPartner: "USAID Clean Oceans / Alliance to End Plastic Waste",
      budgetAmount: "8500000.00",
      spentAmount: "3420000.00",
      targetTonnage: "180.00", // 180 tonnes
      recoveredTonnage: "94.50", // 94.5 tonnes
      startDate: "2026-01-15",
      endDate: "2026-12-31",
      status: "active",
      beneficiariesCount: "145 Informal Youth Waste Collectors",
      notes: "Includes 4 waterfront collection hubs and Tuk-Tuk feeder logistics.",
    })
    .returning();

  await db.insert(schema.invoices).values([
    {
      invoiceNumber: "INV-2026-0182",
      clientId: safariHotel.id,
      amount: "45000.00",
      currency: "KES",
      status: "paid",
      billingPeriod: "August 2026",
      issueDate: "2026-08-01",
      dueDate: "2026-08-15",
      paidDate: "2026-08-12",
      paymentMethod: "M-Pesa Business Till",
      paymentReference: "QKD8912LX",
    },
    {
      invoiceNumber: "INV-2026-0210",
      clientId: eaBottlers.id,
      amount: "95000.00",
      currency: "KES",
      status: "paid",
      billingPeriod: "August 2026",
      issueDate: "2026-08-01",
      dueDate: "2026-08-30",
      paidDate: "2026-08-28",
      paymentMethod: "Bank Wire Transfer",
      paymentReference: "EABL-EFT-99120",
    },
    {
      invoiceNumber: "INV-2026-0245",
      clientId: mombasaGov.id,
      amount: "320000.00",
      currency: "KES",
      status: "pending",
      billingPeriod: "September 2026",
      issueDate: "2026-09-01",
      dueDate: "2026-09-30",
      paymentMethod: "County IFMIS Voucher",
    },
    {
      invoiceNumber: "INV-2026-0246",
      clientId: kilimaniPalms.id,
      amount: "28000.00",
      currency: "KES",
      status: "pending",
      billingPeriod: "September 2026",
      issueDate: "2026-09-01",
      dueDate: "2026-09-15",
    },
  ]);

  await db.insert(schema.expenses).values([
    {
      expenseCode: "EXP-2026-041",
      category: "fuel",
      amount: "48500.00",
      currency: "KES",
      description: "Diesel refuel for Compactor KDD 482B & Flatbed KDE 912K (Total Kenya)",
      vehicleId: truck1.id,
      expenseDate: "2026-09-18",
      paidTo: "TotalEnergies Industrial Area",
    },
    {
      expenseCode: "EXP-2026-042",
      category: "vehicle_maintenance",
      amount: "32000.00",
      currency: "KES",
      description: "Hydraulic ram seal replacement & filter service for Truck KDD 482B",
      vehicleId: truck1.id,
      expenseDate: "2026-09-15",
      paidTo: "Isuzu East Africa Workshop",
    },
    {
      expenseCode: "EXP-2026-043",
      category: "ppe_safety",
      amount: "18500.00",
      currency: "KES",
      description: "Heavy-duty puncture-resistant gloves (40 pairs) and safety boots for field crew",
      expenseDate: "2026-09-10",
      paidTo: "Safety Supplies East Africa",
    },
  ]);

  console.log("✅ Database seeding complete! Rafiki WasteOS operational dataset ready.");
}

// Allow standalone execution
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Seeding failed:", err);
      process.exit(1);
    });
}
