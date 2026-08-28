-- Custom SQL migration file, put your code below! --
-- 시트에서 동기화된 KPI 값의 소수를 버림한다.
--
-- 왜: '연인원봉사시간 누계' 같은 시트 셀이 16,078.5 처럼 소수를 갖는데, 그대로 들어오면
-- 랜딩 KPI 카드가 "16,078.5시간" 이 되어 whitespace-nowrap 숫자가 카드를 넘친다 (사용자 보고 2026-08-28).
-- parse.ts 의 truncateToInt 가 앞으로 들어올 값을 막아 주지만, 이미 저장된 값은 다음 동기화(매주 월)까지
-- 그대로 노출된다. 이 마이그레이션이 그 공백을 없앤다.
--
-- 대상을 sync_source='google_sheets' 로 한정하는 이유: 운영자가 어드민에서 직접 넣은 소수는
-- 의도된 표기일 수 있으므로 건드리지 않는다 (kpi_metrics.value 는 double precision 이고
-- kpiUpdateRowSchema 도 소수를 허용한다).
--
-- 올림·사사오입이 아니라 버림(trunc)인 이유: 누적 실적 수치를 실제보다 크게 표시하지 않는다 (ADR-004 재정 투명성).
UPDATE "kpi_metrics"
SET "value" = trunc("value")
WHERE "sync_source" = 'google_sheets'
  AND "value" IS NOT NULL
  AND "value" <> trunc("value");
