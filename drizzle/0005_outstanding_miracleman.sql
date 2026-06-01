ALTER TABLE "news" ADD COLUMN "hero_rank" integer;--> statement-breakpoint
CREATE UNIQUE INDEX "news_hero_rank_uniq" ON "news" USING btree ("hero_rank") WHERE "news"."hero_rank" IS NOT NULL;