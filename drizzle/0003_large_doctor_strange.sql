ALTER TABLE "kpi_metrics" ADD COLUMN "section" text DEFAULT 'impact' NOT NULL;--> statement-breakpoint
-- StorySection 통계 3행 시드 (후원기관·지원가정·지역시설). 기존/운영 DB 멱등 추가, 이미 있으면 무시
INSERT INTO "kpi_metrics" ("slug", "section", "label", "value", "display_value", "unit", "sort_order") VALUES
	('story_supported_orgs', 'story', '후원 기관', 16, '16개', '개', 1),
	('story_supported_households', 'story', '지원 가정', 23, '23가정', '가정', 2),
	('story_local_facilities', 'story', '지역 시설', 2, '2시설', '시설', 3)
ON CONFLICT ("slug") DO NOTHING;
