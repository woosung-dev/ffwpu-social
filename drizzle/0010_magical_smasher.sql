ALTER TABLE "kpi_metrics" DROP CONSTRAINT "kpi_metrics_section_check";--> statement-breakpoint
ALTER TABLE "kpi_metrics" ADD CONSTRAINT "kpi_metrics_section_check" CHECK ("kpi_metrics"."section" in ('impact', 'story', 'story_text'));--> statement-breakpoint
-- StorySection 카피 3행 seed (태그·제목·부제). 제목/부제는 \n 로 줄 구분 → 공개 렌더 시 줄 단위 엘리먼트. 이미 있으면 운영자 편집 보존(DO NOTHING)
INSERT INTO "kpi_metrics" ("slug", "section", "label", "display_value", "sort_order")
VALUES
  ('story_tag', 'story_text', '태그', '쌀 나눔 활동', 1),
  ('story_title', 'story_text', '제목', E'밥이 사랑입니다\n나누는 우리는 식구입니다', 2),
  ('story_subtitle', 'story_text', '부제', E'온기가 필요한 이웃에게 밥 한 공기의 진심을 전하며,\n더 큰 가족을 만들어갑니다.', 3)
ON CONFLICT ("slug") DO NOTHING;