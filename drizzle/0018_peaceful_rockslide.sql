CREATE TABLE "site_settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"featured_visible_count" integer DEFAULT 6 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "site_settings_singleton" CHECK ("site_settings"."id" = 1)
);
