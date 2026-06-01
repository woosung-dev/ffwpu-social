CREATE TABLE "kpi_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"label" text NOT NULL,
	"value" integer,
	"display_value" text NOT NULL,
	"unit" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "kpi_metrics_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "news" ADD COLUMN "story_slot" integer;--> statement-breakpoint
ALTER TABLE "news" ADD COLUMN "featured_rank" integer;--> statement-breakpoint
CREATE UNIQUE INDEX "news_story_slot_uniq" ON "news" USING btree ("story_slot") WHERE "news"."story_slot" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "news_featured_rank_uniq" ON "news" USING btree ("featured_rank") WHERE "news"."featured_rank" IS NOT NULL;