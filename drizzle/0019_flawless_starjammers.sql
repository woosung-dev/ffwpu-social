ALTER TABLE "categories" DROP CONSTRAINT "categories_slug_unique";--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "board" text DEFAULT 'story' NOT NULL;--> statement-breakpoint
ALTER TABLE "news" ADD COLUMN "board" text DEFAULT 'story' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "categories_board_slug_uniq" ON "categories" USING btree ("board","slug");--> statement-breakpoint
CREATE INDEX "news_board_published_idx" ON "news" USING btree ("board","published_at");--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_board_check" CHECK ("categories"."board" in ('story', 'press'));--> statement-breakpoint
ALTER TABLE "news" ADD CONSTRAINT "news_board_check" CHECK ("news"."board" in ('story', 'press'));--> statement-breakpoint
ALTER TABLE "news" ADD CONSTRAINT "news_press_no_slots" CHECK ("news"."board" = 'story' OR ("news"."story_slot" IS NULL AND "news"."featured_rank" IS NULL AND "news"."hero_rank" IS NULL));