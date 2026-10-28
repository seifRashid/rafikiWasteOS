CREATE TYPE "public"."collection_frequency" AS ENUM('daily', 'twice_weekly', 'weekly', 'bi_weekly', 'monthly', 'on_demand');--> statement-breakpoint
CREATE TYPE "public"."customer_type" AS ENUM('household', 'apartment', 'hotel', 'restaurant', 'business', 'school', 'institution', 'government');--> statement-breakpoint
CREATE TYPE "public"."asset_category" AS ENUM('wheeled_bin_240l', 'wheeled_bin_1100l', 'static_compactor', 'weighbridge_scale', 'baling_press', 'shredder');--> statement-breakpoint
CREATE TYPE "public"."vehicle_status" AS ENUM('active', 'in_transit', 'maintenance', 'idle', 'decommissioned');--> statement-breakpoint
CREATE TYPE "public"."vehicle_type" AS ENUM('compactor_truck', 'flatbed_truck', 'skip_loader', 'tuk_tuk_cargo', 'pickup_utility', 'handcart_crew');--> statement-breakpoint
CREATE TYPE "public"."route_status" AS ENUM('planned', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('scheduled', 'assigned', 'in_progress', 'collected', 'delivered', 'completed', 'missed');--> statement-breakpoint
CREATE TYPE "public"."missed_reason" AS ENUM('gate_locked', 'access_blocked', 'bin_empty', 'client_not_ready', 'severe_weather', 'vehicle_breakdown', 'other');--> statement-breakpoint
CREATE TYPE "public"."waste_stream" AS ENUM('organic', 'recyclable', 'residual', 'hazardous', 'electronic');--> statement-breakpoint
CREATE TYPE "public"."material_stage" AS ENUM('collected', 'sorted', 'stored', 'processed', 'sold', 'transferred');--> statement-breakpoint
CREATE TYPE "public"."material_type" AS ENUM('pet_plastic', 'hdpe_plastic', 'ldpe_film', 'pp_polypropylene', 'cardboard_occ', 'mixed_paper', 'aluminium_cans', 'steel_scrap', 'glass_cullet', 'organic_compost', 'electronic_waste');--> statement-breakpoint
CREATE TYPE "public"."expense_category" AS ENUM('fuel', 'salaries_wages', 'vehicle_maintenance', 'ppe_safety', 'depot_rent_utilities', 'licences_compliance', 'spare_parts', 'other_operational');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('draft', 'pending', 'paid', 'overdue', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('active', 'completed', 'planning', 'on_hold');--> statement-breakpoint
CREATE TYPE "public"."system_role" AS ENUM('super_admin', 'operations_manager', 'finance_officer', 'mrf_operator', 'fleet_supervisor', 'driver_collector', 'esg_auditor', 'client_admin', 'client_user', 'custom', 'unassigned');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'invited', 'pending_approval', 'suspended', 'inactive');--> statement-breakpoint
CREATE TABLE "clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_number" varchar(32) NOT NULL,
	"name" text NOT NULL,
	"customer_type" "customer_type" NOT NULL,
	"contact_person" text,
	"email" text,
	"phone" varchar(32) NOT NULL,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"physical_address" text NOT NULL,
	"county_region" varchar(64) NOT NULL,
	"collection_frequency" "collection_frequency" DEFAULT 'weekly' NOT NULL,
	"collection_days" text,
	"waste_streams" text DEFAULT 'Organic, Recyclable' NOT NULL,
	"bin_count" varchar(128) DEFAULT '2 x 240L Wheeled Bins',
	"contract_start_date" date,
	"contract_end_date" date,
	"monthly_fee" numeric(12, 2) DEFAULT '0.00',
	"currency" varchar(8) DEFAULT 'KES' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "clients_account_number_unique" UNIQUE("account_number")
);
--> statement-breakpoint
CREATE TABLE "assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"asset_tag" varchar(32) NOT NULL,
	"name" varchar(128) NOT NULL,
	"category" "asset_category" NOT NULL,
	"location" text NOT NULL,
	"assigned_client_id" uuid,
	"condition" varchar(32) DEFAULT 'Good',
	"purchase_date" date,
	"purchase_cost" numeric(12, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "assets_asset_tag_unique" UNIQUE("asset_tag")
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plate_number" varchar(32) NOT NULL,
	"model" varchar(64) NOT NULL,
	"type" "vehicle_type" NOT NULL,
	"capacity_kg" numeric(10, 2) NOT NULL,
	"current_mileage_km" integer DEFAULT 0 NOT NULL,
	"next_service_km" integer NOT NULL,
	"assigned_driver_name" varchar(128),
	"assigned_driver_phone" varchar(32),
	"fuel_level_percent" integer DEFAULT 100,
	"status" "vehicle_status" DEFAULT 'active' NOT NULL,
	"insurance_expiry_date" date,
	"inspection_expiry_date" date,
	"depot_location" varchar(128) DEFAULT 'Central Transfer Station',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "vehicles_plate_number_unique" UNIQUE("plate_number")
);
--> statement-breakpoint
CREATE TABLE "dispatch_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"max_stops_per_route" integer DEFAULT 8 NOT NULL,
	"auto_split_exceeded_routes" boolean DEFAULT true NOT NULL,
	"default_start_depot" text DEFAULT 'Central Logistics Depot' NOT NULL,
	"default_end_destination" text DEFAULT 'Mombasa Road MRF & Weighbridge' NOT NULL,
	"operating_days" text DEFAULT 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "routes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"route_code" varchar(32) NOT NULL,
	"name" text NOT NULL,
	"vehicle_id" uuid,
	"driver_name" varchar(128) NOT NULL,
	"driver_phone" varchar(32),
	"crew_names" text,
	"route_date" date NOT NULL,
	"status" "route_status" DEFAULT 'planned' NOT NULL,
	"total_stops" integer DEFAULT 0 NOT NULL,
	"completed_stops" integer DEFAULT 0 NOT NULL,
	"total_distance_km" numeric(8, 2) DEFAULT '0.00',
	"fuel_used_litres" numeric(8, 2) DEFAULT '0.00',
	"start_depot" text DEFAULT 'Central Logistics Depot',
	"end_destination" text DEFAULT 'Mombasa Road MRF & Composting Facility',
	"waypoints_json" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "routes_route_code_unique" UNIQUE("route_code")
);
--> statement-breakpoint
CREATE TABLE "collection_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_number" varchar(32) NOT NULL,
	"client_id" uuid NOT NULL,
	"route_id" uuid,
	"vehicle_id" uuid,
	"driver_name" varchar(128),
	"waste_stream" "waste_stream" DEFAULT 'recyclable' NOT NULL,
	"stop_sequence" integer DEFAULT 1 NOT NULL,
	"expected_quantity_kg" numeric(10, 2) DEFAULT '0.00',
	"gross_weight_kg" numeric(10, 2),
	"tare_weight_kg" numeric(10, 2),
	"actual_weight_kg" numeric(10, 2),
	"scheduled_at" timestamp with time zone NOT NULL,
	"collected_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"status" "job_status" DEFAULT 'scheduled' NOT NULL,
	"missed_reason" "missed_reason",
	"gps_latitude" numeric(10, 7),
	"gps_longitude" numeric(10, 7),
	"proof_photo_url" text,
	"ticket_photo_url" text,
	"bin_condition" varchar(32) DEFAULT 'Normal',
	"client_signature_name" varchar(128),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "collection_jobs_job_number_unique" UNIQUE("job_number")
);
--> statement-breakpoint
CREATE TABLE "recyclable_inventory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"batch_number" varchar(32) NOT NULL,
	"material_type" "material_type" NOT NULL,
	"grade_quality" varchar(32) DEFAULT 'Standard' NOT NULL,
	"collected_weight_kg" numeric(10, 2) NOT NULL,
	"sorted_weight_kg" numeric(10, 2),
	"rejected_weight_kg" numeric(10, 2) DEFAULT '0.00',
	"current_weight_kg" numeric(10, 2) NOT NULL,
	"stage" "material_stage" DEFAULT 'collected' NOT NULL,
	"storage_bay" varchar(64) NOT NULL,
	"intake_job_id" uuid,
	"buyer_name" varchar(128),
	"unit_selling_price" numeric(10, 2),
	"total_revenue" numeric(12, 2),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "recyclable_inventory_batch_number_unique" UNIQUE("batch_number")
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"expense_code" varchar(32) NOT NULL,
	"category" "expense_category" NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency" varchar(8) DEFAULT 'KES' NOT NULL,
	"description" text NOT NULL,
	"vehicle_id" uuid,
	"project_id" uuid,
	"expense_date" date NOT NULL,
	"receipt_photo_url" text,
	"paid_to" varchar(128),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "expenses_expense_code_unique" UNIQUE("expense_code")
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_number" varchar(32) NOT NULL,
	"client_id" uuid NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency" varchar(8) DEFAULT 'KES' NOT NULL,
	"status" "invoice_status" DEFAULT 'pending' NOT NULL,
	"billing_period" varchar(64) NOT NULL,
	"issue_date" date NOT NULL,
	"due_date" date NOT NULL,
	"paid_date" date,
	"payment_method" varchar(64),
	"payment_reference" varchar(64),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_code" varchar(32) NOT NULL,
	"name" text NOT NULL,
	"donor_partner" varchar(128) NOT NULL,
	"budget_amount" numeric(14, 2) NOT NULL,
	"spent_amount" numeric(14, 2) DEFAULT '0.00' NOT NULL,
	"target_tonnage" numeric(10, 2) NOT NULL,
	"recovered_tonnage" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"status" "project_status" DEFAULT 'active' NOT NULL,
	"beneficiaries_count" varchar(64) DEFAULT '140 Informal Waste Pickers',
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "projects_project_code_unique" UNIQUE("project_code")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(64) NOT NULL,
	"name" varchar(128) NOT NULL,
	"description" text NOT NULL,
	"badge_color" varchar(32) DEFAULT '#00993F' NOT NULL,
	"permissions" jsonb NOT NULL,
	"is_system" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "roles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_user_id" text,
	"client_id" uuid,
	"full_name" varchar(128) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(32) NOT NULL,
	"role" "system_role" DEFAULT 'unassigned' NOT NULL,
	"role_title" varchar(64) DEFAULT 'Pending Role Assignment' NOT NULL,
	"status" "user_status" DEFAULT 'pending_approval' NOT NULL,
	"avatar_url" text,
	"depot_location" varchar(128) DEFAULT 'Central Transfer Station',
	"assigned_vehicle_plate" varchar(32),
	"last_login_at" timestamp with time zone,
	"last_login_ip" varchar(45),
	"two_factor_enabled" boolean DEFAULT false NOT NULL,
	"custom_permissions" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "customer_complaints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_number" varchar(32) NOT NULL,
	"client_id" uuid NOT NULL,
	"category" varchar(128) NOT NULL,
	"subject" text NOT NULL,
	"description" text NOT NULL,
	"priority" varchar(32) DEFAULT 'medium' NOT NULL,
	"status" varchar(32) DEFAULT 'open' NOT NULL,
	"assigned_to" text,
	"resolution_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	CONSTRAINT "customer_complaints_ticket_number_unique" UNIQUE("ticket_number")
);
--> statement-breakpoint
CREATE TABLE "customer_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_number" varchar(32) NOT NULL,
	"client_id" uuid NOT NULL,
	"type" varchar(128) NOT NULL,
	"subject" text NOT NULL,
	"details" text NOT NULL,
	"priority" varchar(32) DEFAULT 'normal' NOT NULL,
	"status" varchar(32) DEFAULT 'pending' NOT NULL,
	"preferred_date" date,
	"admin_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	CONSTRAINT "customer_requests_ticket_number_unique" UNIQUE("ticket_number")
);
--> statement-breakpoint
CREATE TABLE "waste_materials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(32) NOT NULL,
	"name" varchar(128) NOT NULL,
	"category" varchar(64) NOT NULL,
	"benchmark_price" numeric(10, 2) NOT NULL,
	"bale_density" varchar(128) NOT NULL,
	"acceptable" text NOT NULL,
	"rejects" text NOT NULL,
	"is_verified" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "waste_materials_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "routes" ADD CONSTRAINT "routes_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection_jobs" ADD CONSTRAINT "collection_jobs_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection_jobs" ADD CONSTRAINT "collection_jobs_route_id_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."routes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection_jobs" ADD CONSTRAINT "collection_jobs_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recyclable_inventory" ADD CONSTRAINT "recyclable_inventory_intake_job_id_collection_jobs_id_fk" FOREIGN KEY ("intake_job_id") REFERENCES "public"."collection_jobs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_complaints" ADD CONSTRAINT "customer_complaints_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_requests" ADD CONSTRAINT "customer_requests_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;