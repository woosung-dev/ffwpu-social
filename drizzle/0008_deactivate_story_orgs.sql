-- 후원 기관(story_supported_orgs) 통계 비활성화 — 랜딩 StorySection 에서 제외 (hide-when-empty 설계, 사용자 요청).
-- ADR-003 누적·삭제 금지 → DELETE 대신 is_active=false 로 비노출(데이터 보존). seed.ts 정의 제거(#53)와 동기화.
UPDATE "kpi_metrics" SET "is_active" = false WHERE "slug" = 'story_supported_orgs';
