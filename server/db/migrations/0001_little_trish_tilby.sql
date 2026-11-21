CREATE TABLE "container_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(32) NOT NULL,
	"name" varchar(128) NOT NULL,
	"category" varchar(64) NOT NULL,
	"capacity_litres" integer NOT NULL,
	"compatible_stream" varchar(64) DEFAULT 'All Streams' NOT NULL,
	"total_stock" integer DEFAULT 0 NOT NULL,
	"color_code" varchar(32) DEFAULT '#00993F' NOT NULL,
	"rfid_tracked" boolean DEFAULT true NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "container_types_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "recyclable_inventory" ALTER COLUMN "material_type" SET DATA TYPE varchar(64);--> statement-breakpoint
ALTER TABLE "waste_materials" ADD COLUMN "waste_stream" varchar(32) DEFAULT 'recyclable' NOT NULL;