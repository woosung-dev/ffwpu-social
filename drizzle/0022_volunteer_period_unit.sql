-- Custom SQL migration file, put your code below! --
-- '누적 봉사 기간'(volunteer_period) 카드의 단위를 '시간' 으로 채운다.
--
-- 왜: 이 카드는 원래 비숫자 표기("38년 5개월")여서 value·unit 이 NULL 이었다. 그런데 ADR-058 매핑에서
-- 시트 '연인원봉사시간 누계' 가 이 slug 에 **시간 숫자**를 넣기 시작했다. unit 이 비어 있으면
-- formatKpiDisplay 가 `value.toLocaleString() + (unit ?? "")` 라 동기화 직후
-- "16,078" 처럼 **단위 없는 맨숫자**가 랜딩에 노출된다 (사용자 보고 2026-08-28).
--
-- 이미 단위가 있는 행은 건드리지 않는다 — 운영자 입력 우선 (0020 과 동일 패턴).
-- 표시값(display_value)·라벨은 운영자 소유라 손대지 않는다.
UPDATE "kpi_metrics"
SET "unit" = '시간'
WHERE "slug" = 'volunteer_period'
  AND ("unit" IS NULL OR "unit" = '');
