-- Custom SQL migration file, put your code below! --
-- StorySection 통계를 impact KPI 와 같은 "숫자 우선" 모델로 전환하기 위한 단위 backfill.
-- 쌀나눔 시트 동기화는 value(숫자)만 갱신하고 단위·라벨은 운영자 소유라 건드리지 않는다 →
-- 단위가 비어 있으면 첫 동기화 직후 "3,210kg" 이 "3,210" 으로 표시돼 버린다.
--
-- 현재 화면 표기("2,370kg" · "106가정" · "6개 시설")를 그대로 재현하는 단위를 넣는다.
-- 값(value)은 건드리지 않는다 — value 가 NULL 인 동안은 formatKpiDisplay 가 기존 display_value 를
-- 그대로 반환하므로 이 마이그레이션만 적용된 상태의 화면 변화는 0 이다.
-- 이미 단위를 넣어둔 행은 운영자 입력이 우선이므로 덮어쓰지 않는다.
UPDATE "kpi_metrics" SET "unit" = 'kg'
WHERE "slug" = 'story_supported_orgs' AND ("unit" IS NULL OR "unit" = '');--> statement-breakpoint

UPDATE "kpi_metrics" SET "unit" = '가정'
WHERE "slug" = 'story_supported_households' AND ("unit" IS NULL OR "unit" = '');--> statement-breakpoint

UPDATE "kpi_metrics" SET "unit" = '개 시설'
WHERE "slug" = 'story_local_facilities' AND ("unit" IS NULL OR "unit" = '');
