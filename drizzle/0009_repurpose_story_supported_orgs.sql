-- Custom SQL migration file, put your code below! --
-- StorySection: '후원 기관'(이전에 is_active=false 로 숨김) 행을 '나눈 사랑(쌀)의 무게' 로 전환(사용자 요청).
-- is_active=true 로 재활성(표시값 비면 렌더에서 숨김). slug 는 immutable 이라 유지(라벨만 변경).
UPDATE "kpi_metrics"
SET "label" = '나눈 사랑(쌀)의 무게', "display_value" = '', "value" = NULL, "unit" = NULL, "is_active" = true
WHERE "slug" = 'story_supported_orgs';