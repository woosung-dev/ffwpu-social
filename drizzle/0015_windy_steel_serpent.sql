CREATE TABLE "popups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"image_url" text NOT NULL,
	"image_width" integer,
	"image_height" integer,
	"link_url" text,
	"link_target" text DEFAULT 'small_window' NOT NULL,
	"starts_at" timestamp NOT NULL,
	"ends_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid,
	CONSTRAINT "popups_link_target_check" CHECK ("popups"."link_target" in ('self', 'new_tab', 'small_window'))
);
--> statement-breakpoint
ALTER TABLE "popups" ADD CONSTRAINT "popups_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "popups_window_idx" ON "popups" USING btree ("is_active","starts_at","ends_at");