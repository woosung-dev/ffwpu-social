CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
DROP INDEX "uniq_heart";--> statement-breakpoint
ALTER TABLE "news" ADD COLUMN "category_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "news" ADD CONSTRAINT "news_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_heart" ON "heart_events" USING btree ("news_id","session_id");--> statement-breakpoint
ALTER TABLE "heart_events" DROP COLUMN "ip_hash";--> statement-breakpoint
ALTER TABLE "news" DROP COLUMN "category";--> statement-breakpoint
DROP TYPE "public"."news_category";